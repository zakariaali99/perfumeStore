from django.contrib import admin
from .models import CustomerProfile, CustomerTag, CustomerInteraction


@admin.register(CustomerTag)
class CustomerTagAdmin(admin.ModelAdmin):
    list_display = ['name', 'color']


@admin.register(CustomerInteraction)
class CustomerInteractionAdmin(admin.ModelAdmin):
    list_display = ['customer', 'interaction_type', 'subject', 'created_by', 'created_at']
    list_filter = ['interaction_type', 'created_at']


@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'city', 'segment', 'total_orders', 'total_spent', 'created_at']
    list_filter = ['segment', 'city', 'tags']
    search_fields = ['name', 'phone', 'email']
    filter_horizontal = ['tags', 'favorite_brands', 'favorite_families']
