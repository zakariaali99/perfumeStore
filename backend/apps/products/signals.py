from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import ProductVariant
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=ProductVariant)
def stock_alert_notification(sender, instance, **kwargs):
    """
    Send an email notification to the store owner when stock is low (e.g., <= 5).
    """
    if instance.stock_quantity <= 5:
        subject = f'⚠️ تنبيه: مخزون منخفض - {instance.product.name_ar} ({instance.size_ml}مل)'
        message = f'عدد القطع المتبقية من {instance.product.name_ar} (الحجم: {instance.size_ml}مل) هو {instance.stock_quantity} فقط.\n\nيرجى تحديث المخزون في أقرب وقت.'
        
        # Get admin emails from settings or DB
        admin_emails = [a[1] for a in settings.ADMINS] if settings.ADMINS else []
        if not admin_emails:
            # Fallback to DEFAULT_FROM_EMAIL or manually defined
            admin_emails = [settings.DEFAULT_FROM_EMAIL]
            
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                admin_emails,
                fail_silently=True,
            )
            logger.info(f"Stock alert sent for {instance.product.name_ar}")
        except Exception as e:
            logger.error(f"Error sending stock alert: {e}")
