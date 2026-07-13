from rest_framework import serializers
from .models import HeroSlide, Banner, StoreSettings, HomePageSection


class HeroSlideSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroSlide
        fields = '__all__'


class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = '__all__'


class StoreSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreSettings
        fields = '__all__'


class HomePageSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomePageSection
        fields = '__all__'
