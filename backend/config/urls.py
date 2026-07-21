from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/accounts/", include("accounts.urls")),
    path("api/products/", include("products.urls")),
    path("api/orders/", include("orders.urls")),
    path("api/cart/", include("cart.urls")),
    path("api/crm/", include("crm.urls")),
    path("api/analytics/", include("analytics.urls")),
    path("api/cms/", include("cms.urls")),
    path("api/marketing/", include("marketing.urls")),
    path("api/recommendations/", include("recommendations.urls")),
    path("api/backups/", include("backups.urls")),
]

# SPA catch-all — serve index.html for all non-API, non-admin, non-static routes
urlpatterns += [re_path(r'^(?!api/|admin/|static/|media/).*$',
                        TemplateView.as_view(template_name='index.html'))]

# Serve media files in all environments (DEBUG or not)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
