from django.urls import path
from .views import DashboardStatsView, InventoryReportView

urlpatterns = [
    path('stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('inventory/', InventoryReportView.as_view(), name='inventory-report'),
]
