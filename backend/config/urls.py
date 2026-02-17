from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve

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
]

# Serve media/static files (including when DEBUG=False for easy demo)
urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
]
