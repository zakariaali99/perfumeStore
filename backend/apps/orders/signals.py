from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from .models import Order, OrderStatusHistory

@receiver(post_save, sender=Order)
def order_create_notification(sender, instance, created, **kwargs):
    if created:
        # Send confirmation email to customer
        if instance.customer_email:
            subject = f'تأكيد طلبك رق {instance.order_number} - متجر المصطفى'
            message = f'شكراً لك {instance.customer_name}. تم استلام طلبك وهو الآن قيد المراجعة.'
            
            # In a real app, use render_to_string with an HTML template
            # html_message = render_to_string('emails/order_confirmation.html', {'order': instance})
            
            try:
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [instance.customer_email],
                    fail_silently=True,
                )
            except Exception as e:
                print(f"Error sending email: {e}")

@receiver(post_save, sender=OrderStatusHistory)
def order_status_change_notification(sender, instance, created, **kwargs):
    if created:
        order = instance.order
        if order.customer_email:
            status_labels = dict(Order.STATUS_CHOICES)
            status_label = status_labels.get(instance.status, instance.status)
            
            subject = f'تحديث حالة طلبك {order.order_number} - {status_label}'
            message = f'مرحباً {order.customer_name}، تم تحديث حالة طلبك إلى: {status_label}.\n\nملاحظات: {instance.notes}'
            
            try:
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [order.customer_email],
                    fail_silently=True,
                )
            except Exception as e:
                print(f"Error sending status email: {e}")
