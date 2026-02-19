from django.db.models import Sum, Count, Avg
from django.db.models.functions import TruncMonth
from rest_framework import viewsets, filters, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from orders.models import Order, OrderItem
from products.models import Product
from crm.models import CustomerProfile
from django.utils import timezone
from datetime import timedelta
from dateutil.relativedelta import relativedelta

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        now = timezone.now()
        days = int(request.query_params.get('days', 30))
        this_month_start = now - timedelta(days=days)
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
        cur_month_customers = CustomerProfile.objects.filter(created_at__gte=this_month_start).count()
        
        # Last Month Stats (for trend)
        prev_month_rev = Order.objects.filter(status='delivered', created_at__gte=last_month_start, created_at__lte=last_month_end).aggregate(Sum('total'))['total__sum'] or 0
        prev_month_orders = Order.objects.filter(created_at__gte=last_month_start, created_at__lte=last_month_end).count()
        prev_month_customers = CustomerProfile.objects.filter(created_at__gte=last_month_start, created_at__lte=last_month_end).count()

        def calc_trend(cur, prev):
            if prev > 0:
                return round(((cur - prev) / prev) * 100, 1)
            return 0

        rev_trend = calc_trend(cur_month_rev, prev_month_rev)
        orders_trend = calc_trend(cur_month_orders, prev_month_orders)
        customers_trend = calc_trend(cur_month_customers, prev_month_customers)

        # Monthly Revenue (Last 12 months)
        one_year_ago = this_month_start - relativedelta(years=1)
        monthly_sales = Order.objects.filter(status='delivered', created_at__gte=one_year_ago) \
            .annotate(month=TruncMonth('created_at')) \
            .values('month') \
            .annotate(revenue=Sum('total'), orders=Count('id')) \
            .order_by('month')

        # Top Products
        top_products = OrderItem.objects.values('product_name') \
            .annotate(total_sold=Sum('quantity'), revenue=Sum('total_price')) \
            .order_by('-total_sold')[:5]

        # City Sales
        city_sales = Order.objects.values('city') \
            .annotate(revenue=Sum('total'), count=Count('id')) \
            .order_by('-revenue')

        # Customer Segments
        customer_segments = CustomerProfile.objects.values('segment') \
            .annotate(count=Count('id'))

        # Recent Orders
        recent_orders = Order.objects.order_by('-created_at')[:10]
        from orders.serializers import OrderSerializer

        return Response({
            'summary': {
                'total_revenue': total_revenue,
                'total_orders': total_orders,
                'total_products': total_products,
                'total_customers': total_customers,
                'aov': total_revenue / total_orders if total_orders > 0 else 0,
                'monthly_revenue': cur_month_rev,
                'revenue_trend': rev_trend,
                'orders_trend': orders_trend,
                'customers_trend': customers_trend,
                'mrr': cur_month_rev, # For this store, MRR is current month revenue
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
        from products.models import ProductVariant
        low_stock_variants = ProductVariant.objects.filter(stock_quantity__lte=5).select_related('product')
        
        return Response({
            'low_stock': [
                {
                    'product': v.product.name_ar,
                    'size': v.size_ml,
                    'stock': v.stock_quantity
                } for v in low_stock_variants
            ]
        })
