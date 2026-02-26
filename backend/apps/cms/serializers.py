from rest_framework import serializers
from .models import HeroSlide, Banner, StoreSettings, HomePageSection

class HeroSlideSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroSlide
        fields = '__all__'

class HomePageSectionSerializer(serializers.ModelSerializer):
    section_display = serializers.CharField(source='get_key_display', read_only=True)
    class Meta:
        model = HomePageSection
        fields = '__all__'

class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = '__all__'

class StoreSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreSettings
        fields = '__all__'
