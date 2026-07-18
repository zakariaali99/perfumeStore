from django.contrib import admin
from .models import Backup


@admin.register(Backup)
class BackupAdmin(admin.ModelAdmin):
    list_display = ['created_at', 'file_size', 'status']
    list_filter = ['status']
    readonly_fields = ['created_at', 'file_size', 'status', 'notes', 'file']
