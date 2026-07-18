from rest_framework import serializers
from .models import Backup


class BackupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Backup
        fields = ['id', 'created_at', 'file_size', 'status', 'notes']
        read_only_fields = ['id', 'created_at', 'file_size', 'status', 'notes']
