from decimal import Decimal
from datetime import timedelta
from django.db.models import Sum, Count, F
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from orders.models import Order, OrderItem
from products.models import Product, ProductVariant
from crm.models import CustomerProfile
from dateutil.relativedelta import relativedelta
from orders.serializers import OrderSerializer


class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    RANGE_WINDOWS = {
        '30d': timedelta(days=30),
        '90d': timedelta(days=90),
    }

    def _get_window(self, range_param, now):
        """Return (start, end) for the selected range or (None, None) for all-time."""
        if range_param in self.RANGE_WINDOWS:
            end = now
            start = end - self.RANGE_WINDOWS[range_param]
            return start, end
        return None, None

    def _apply_window(self, queryset, start, end, field='created_at'):
        if start and end:
            return queryset.filter(**{f'{field}__gte': start, f'{field}__lte': end})
        return queryset

    def _previous_window(self, start, end):
        """Return the immediately preceding window of the same length."""
        delta = end - start
        return start - delta, start

    def get(self, request):
        now = timezone.now()
        range_param = request.query_params.get('range', 'all')
        start, end = self._get_window(range_param, now)
        use_window = start is not None and end is not None

        # Base order querysets
        orders_qs = self._apply_window(Order.objects.all(), start, end)
        delivered_qs = orders_qs.filter(status='delivered')

        # Core Stats
        total_revenue = delivered_qs.aggregate(Sum('total'))['total__sum'] or Decimal('0.00')
        total_orders = orders_qs.count()

        if use_window:
            # Active customers = distinct customers with orders in the window
            total_customers = (
                CustomerProfile.objects.filter(orders__created_at__gte=start, orders__created_at__lte=end)
                .distinct()
                .count()
            )
            prev_start, prev_end = self._previous_window(start, end)
            prev_revenue = (
                Order.objects.filter(
                    status='delivered',
                    created_at__gte=prev_start,
                    created_at__lte=prev_end
                ).aggregate(Sum('total'))['total__sum'] or Decimal('0.00')
            )
            monthly_revenue = total_revenue
        else:
            # All-time view: keep legacy current-month vs previous-month trend
            total_customers = CustomerProfile.objects.count()
            this_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            last_month_start = this_month_start - relativedelta(months=1)
            last_month_end = this_month_start - timedelta(seconds=1)
            monthly_revenue = (
                Order.objects.filter(status='delivered', created_at__gte=this_month_start)
                .aggregate(Sum('total'))['total__sum'] or Decimal('0.00')
            )
            prev_revenue = (
                Order.objects.filter(
                    status='delivered',
                    created_at__gte=last_month_start,
                    created_at__lte=last_month_end
                ).aggregate(Sum('total'))['total__sum'] or Decimal('0.00')
            )

        aov = total_revenue / total_orders if total_orders > 0 else Decimal('0.00')

        rev_trend = Decimal('0.00')
        if prev_revenue > 0:
            rev_trend = ((monthly_revenue - prev_revenue) / prev_revenue) * 100

        # Monthly Revenue (filtered by window when range is set)
        monthly_sales_qs = self._apply_window(
            Order.objects.filter(status='delivered'), start, end
        )
        monthly_sales = list(
            monthly_sales_qs.annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(revenue=Sum('total'), orders=Count('id'))
            .order_by('month')
        )

        # Top Products (filtered by window)
        top_products_qs = self._apply_window(OrderItem.objects, start, end, field='order__created_at')
        top_products = list(
            top_products_qs.select_related('variant__product')
            .values('variant__product_id', 'product_name')
            .annotate(total_sold=Sum('quantity'), revenue=Sum('total_price'))
            .order_by('-total_sold')[:5]
        )

        # City Sales (filtered by window)
        city_sales_qs = self._apply_window(Order.objects, start, end)
        city_sales = list(
            city_sales_qs.values('city')
            .annotate(revenue=Sum('total'), count=Count('id'))
            .order_by('-revenue')
        )

        # Customer Segments (filtered by window)
        if use_window:
            segments_qs = CustomerProfile.objects.filter(
                orders__created_at__gte=start, orders__created_at__lte=end
            )
        else:
            segments_qs = CustomerProfile.objects.all()
        customer_segments = list(
            segments_qs.values('segment').annotate(count=Count('id', distinct=use_window))
        )

        # Recent Orders (filtered by window)
        recent_orders_qs = (
            self._apply_window(Order.objects, start, end)
            .select_related('customer', 'coupon', 'assigned_to')
            .prefetch_related('items__variant__product', 'status_history__changed_by')
            .order_by('-created_at')[:10]
        )

        return Response({
            'summary': {
                'total_revenue': total_revenue,
                'total_orders': total_orders,
                'total_products': Product.objects.count(),
                'total_customers': total_customers,
                'aov': aov,
                'monthly_revenue': monthly_revenue,
                'revenue_trend': round(rev_trend, 1),
                'range': range_param,
            },
            'monthly_sales': monthly_sales,
            'top_products': top_products,
            'city_sales': city_sales,
            'customer_segments': customer_segments,
            'recent_orders': OrderSerializer(recent_orders_qs, many=True).data
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
