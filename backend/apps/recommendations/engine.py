from django.db.models import Count, Q
from products.models import Product
from orders.models import OrderItem


class RecommendationEngine:
    @staticmethod
    def get_similar_products(product, limit=4):
        """
        Similar products based on:
        1. Same gender (High weight)
        2. Same brand (Medium weight)
        3. Shared categories (Low weight)
        """
        category_ids = product.categories.values_list('id', flat=True)

        qs = Product.objects.filter(is_active=True).exclude(id=product.id)
        qs = qs.annotate(
            variant_count=Count('variants', filter=Q(variants__stock_quantity__gt=0))
        )

        from django.db.models import Case, When, IntegerField

        qs = qs.annotate(
            relevance_score=Case(
                When(gender=product.gender, then=5),
                default=0,
                output_field=IntegerField(),
            ) + Case(
                When(brand=product.brand, then=3),
                default=0,
                output_field=IntegerField(),
            ) + Case(
                When(categories__in=category_ids, then=2),
                default=0,
                output_field=IntegerField(),
            )
        ).order_by('-relevance_score', '-created_at').distinct()[:limit]

        return qs

    @staticmethod
    def get_bought_together(product, limit=4):
        """
        Finds products that were frequently bought in the same order as this product.
        """
        order_ids = OrderItem.objects.filter(
            variant__product=product
        ).values_list('order_id', flat=True)

        if not order_ids:
            return Product.objects.none()

        ranked_ids = OrderItem.objects.filter(
            order_id__in=order_ids
        ).exclude(
            variant__product=product
        ).values('variant__product_id')\
        .annotate(frequency=Count('variant__product_id'))\
        .order_by('-frequency')\
        .values_list('variant__product_id', flat=True)[:limit]

        # Preserve frequency ordering
        from django.db.models import Case, When, IntegerField
        preserved_order = Case(*[
            When(id=pid, then=pos) for pos, pid in enumerate(ranked_ids)
        ], output_field=IntegerField())

        return Product.objects.filter(
            id__in=list(ranked_ids), is_active=True
        ).order_by(preserved_order)

    @staticmethod
    def get_new_arrivals(limit=4):
        return Product.objects.filter(is_active=True, is_new=True).order_by('-created_at')[:limit]

    @staticmethod
    def get_bestsellers(limit=4):
        return Product.objects.filter(is_active=True, is_bestseller=True).order_by('-sales_count')[:limit]
