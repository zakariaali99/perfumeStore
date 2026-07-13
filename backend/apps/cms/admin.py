from django.contrib import admin
from .models import HeroSlide, Banner, StoreSettings, HomePageSection


@admin.register(HeroSlide)
class HeroSlideAdmin(admin.ModelAdmin):
    list_display = ['title', 'order', 'is_active']
    list_editable = ['order', 'is_active']


@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ['title', 'position', 'is_active']
    list_filter = ['position', 'is_active']


@admin.register(StoreSettings)
class StoreSettingsAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        return not StoreSettings.objects.exists()


@admin.register(HomePageSection)
class HomePageSectionAdmin(admin.ModelAdmin):
    list_display = ['key', 'title_ar', 'order', 'is_active']
    list_editable = ['order', 'is_active']
