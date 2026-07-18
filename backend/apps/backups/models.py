from django.db import models


class Backup(models.Model):
    STATUS_CHOICES = [
        ('creating', 'جاري الإنشاء'),
        ('ready', 'جاهز'),
        ('failed', 'فشل'),
        ('restoring', 'جاري الاستعادة'),
    ]

    created_at = models.DateTimeField(auto_now_add=True)
    file = models.FileField(upload_to='backups/')
    file_size = models.BigIntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='creating')
    notes = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Backup {self.created_at.strftime("%Y-%m-%d %H:%M")}'
