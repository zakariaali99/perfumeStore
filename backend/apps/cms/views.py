from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import HeroSlide, Banner, StoreSettings, HomePageSection
from .serializers import HeroSlideSerializer, BannerSerializer, StoreSettingsSerializer, HomePageSectionSerializer

class HeroSlideViewSet(viewsets.ModelViewSet):
    queryset = HeroSlide.objects.all()
    serializer_class = HeroSlideSerializer
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
    def get_authenticators(self):
        if self.request.method == 'GET':
            return []
        return super().get_authenticators()

    def get_queryset(self):
        if self.request.user.is_staff:
            return HeroSlide.objects.all()
        return HeroSlide.objects.filter(is_active=True)

class BannerViewSet(viewsets.ModelViewSet):
    queryset = Banner.objects.all()
    serializer_class = BannerSerializer
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
    def get_authenticators(self):
        if self.request.method == 'GET':
            return []
        return super().get_authenticators()

    def get_queryset(self):
        if self.request.user.is_staff:
            return Banner.objects.all()
        return Banner.objects.filter(is_active=True)

class StoreSettingsViewSet(viewsets.ModelViewSet):
    queryset = StoreSettings.objects.all()
    serializer_class = StoreSettingsSerializer
    
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
    def get_authenticators(self):
        if self.request.method == 'GET':
            return []
        return super().get_authenticators()

    def list(self, request, *args, **kwargs):
        settings = StoreSettings.objects.first()
        if not settings:
            settings = StoreSettings.objects.create()
        serializer = self.get_serializer(settings)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        return Response({'error': 'Method not allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

class HomePageSectionViewSet(viewsets.ModelViewSet):
    queryset = HomePageSection.objects.all()
    serializer_class = HomePageSectionSerializer
    
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_authenticators(self):
        if self.request.method == 'GET':
            return []
        return super().get_authenticators()
    
    def list(self, request, *args, **kwargs):
        # Default content mapping for each section type
        DEFAULT_CONTENTS = {
            'ramadan': {
                'heading': 'رمضان كريم',
                'subtitle': 'أجواء رمضانية فاخرة مع أرقى العطور الشرقية',
                'button_text': 'اكتشف عطور رمضان',
                'button_link': '/products'
            },
            'features': [
                {'title': 'جودة استثنائية', 'desc': 'نستخدم أندر المكونات الطبيعية والزيوت العطرية النقية لضمان ثبات عالي وجاذبية لا تقاوم.'},
                {'title': 'أصالة مضمونة', 'desc': 'كافة عطورنا أصلية 100% ومن مصادرها الرسمية، نهتم بكل تفصيلة لتصلك الجودة كما هي.'},
                {'title': 'توصيل سريع', 'desc': 'خدمة شحن موثوقة تغطي كافة أنحاء ليبيا، مع تغليف فاخر يحمي منتجاتك ويجمل هديتك.'},
                {'title': 'تغليف فاخر', 'desc': 'نغلف كل طلب بعناية فائقة بتغليف أنيق يليق بقيمة العطر، مثالي كهدية مميزة لمن تحب.'}
            ],
            'categories': {
                'heading': 'تسوق حسب الفئات',
                'subtitle': 'اكتشف مجموعاتنا الحصرية المصنفة بعناية لتناسب ذوقك الرفيع.'
            },
            'best_sellers': {
                'heading': 'الأكثر مبيعاً',
                'button_text': 'إكتشف الكل'
            },
            'featured_products': {
                'heading': 'عطور مختارة لك',
                'subtitle': 'Best Sellers'
            },
            'stats': [
                {'value': '15K+', 'label': 'عميل سعيد'},
                {'value': '500+', 'label': 'عطر حصري'},
                {'value': '10+', 'label': 'سنوات خبرة'},
                {'value': '24/7', 'label': 'خدمة عملاء'}
            ],
            'vision': {
                'quote': 'العطر هو اللغة التي لا تحتاج إلى كلمات لتخبر العالم من أنت.',
                'description': 'في بوتيك المصطفى، نؤمن أن العطر ليس مجرد منتج، بل هو رحلة عبر الزمن والمكان، تجسد أرقى معاني الفخامة والجمال العربي الأصيل.',
                'cities': ['طرابلس', 'بنغازي', 'مصراتة', 'سبها', 'الزاوية']
            }
        }

        # Initialize sections if they don't exist
        for idx, (key, display) in enumerate(HomePageSection.SECTION_KEYS):
            section_content = DEFAULT_CONTENTS.get(key, {})
            section, created = HomePageSection.objects.get_or_create(
                key=key, 
                defaults={
                    'title_ar': display, 
                    'is_active': True, 
                    'order': idx,
                    'content': section_content
                }
            )
            # If the section exists but content is empty, initialize it
            if not section.content and section_content:
                section.content = section_content
                section.save()
        
        return super().list(request, *args, **kwargs)

