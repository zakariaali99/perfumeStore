from django.db.models import Sum, Count, F
from django.db.models.functions import TruncMonth
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from orders.models import Order, OrderItem
from products.models import Product, ProductVariant
from crm.models import CustomerProfile
from django.utils import timezone
from datetime import timedelta
from dateutil.relativedelta import relativedelta
from orders.serializers import OrderSerializer


class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        now = timezone.now()
        this_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_month_start = this_month_start - relativedelta(months=1)
        last_month_end = this_month_start - timedelta(seconds=1)

        # Core Stats (Total)
        total_revenue = Order.objects.filter(status='delivered').aggregate(Sum('total'))['total__sum'] or 0
        total_orders = Order.objects.count()
        total_products = Product.objects.count()
        total_customers = CustomerProfile.objects.count()

        # Current Month Stats
        cur_month_rev = Order.objects.filter(status='delivered', created_at__gte=this_month_start).aggregate(Sum('total'))['total__sum'] or 0
        cur_month_orders = Order.objects.filter(created_at__gte=this_month_start).count()

        # Last Month Stats (for trend)
        prev_month_rev = Order.objects.filter(status='delivered', created_at__gte=last_month_start, created_at__lte=last_month_end).aggregate(Sum('total'))['total__sum'] or 0

        rev_trend = 0
        if prev_month_rev > 0:
            rev_trend = ((cur_month_rev - prev_month_rev) / prev_month_rev) * 100

        # Monthly Revenue
        monthly_sales = list(
            Order.objects.filter(status='delivered')
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(revenue=Sum('total'), orders=Count('id'))
            .order_by('month')
        )

        # Top Products (group by product_id to avoid name collisions)
        top_products = list(
            OrderItem.objects.select_related('variant__product')
            .values('variant__product_id', 'product_name')
            .annotate(total_sold=Sum('quantity'), revenue=Sum('total_price'))
            .order_by('-total_sold')[:5]
        )

        # City Sales
        city_sales = list(
            Order.objects.values('city')
            .annotate(revenue=Sum('total'), count=Count('id'))
            .order_by('-revenue')
        )

        # Customer Segments
        customer_segments = list(
            CustomerProfile.objects.values('segment')
            .annotate(count=Count('id'))
        )

        # Recent Orders (with prefetches)
        recent_orders = Order.objects.select_related(
            'customer', 'coupon', 'assigned_to'
        ).prefetch_related(
            'items__variant__product',
            'status_history__changed_by'
        ).order_by('-created_at')[:10]

        return Response({
            'summary': {
                'total_revenue': total_revenue,
                'total_orders': total_orders,
                'total_products': total_products,
                'total_customers': total_customers,
                'aov': total_revenue / total_orders if total_orders > 0 else 0,
                'monthly_revenue': cur_month_rev,
                'revenue_trend': round(rev_trend, 1)
            },
            'monthly_sales': monthly_sales,
            'top_products': top_products,
            'city_sales': city_sales,
            'customer_segments': customer_segments,
            'recent_orders': OrderSerializer(recent_orders, many=True).data
        })


class InventoryReportView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        low_stock_variants = ProductVariant.objects.filter(
            stock_quantity__lte=F('low_stock_threshold')
        ).select_related('product')

        return Response({
            'low_stock': [
                {
                    'product': v.product.name_ar,
                    'size': v.size_ml,
                    'stock': v.stock_quantity,
                    'threshold': v.low_stock_threshold
                } for v in low_stock_variants
            ]
        })
