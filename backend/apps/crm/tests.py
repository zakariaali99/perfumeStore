from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from .models import CustomerProfile, CustomerTag, CustomerInteraction

class CRMTests(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_superuser(username='admin', password='password', email='admin@example.com')
        self.customer = CustomerProfile.objects.create(name='Ahmed', phone='0910000000')

    def test_customer_profiles_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('customerprofile-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data['results']) >= 1)

    def test_customer_update(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('customerprofile-detail', args=[self.customer.id])
        response = self.client.patch(url, {'name': 'Ahmed Updated'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(CustomerProfile.objects.get(id=self.customer.id).name, 'Ahmed Updated')

    def test_customer_delete(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('customerprofile-detail', args=[self.customer.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(CustomerProfile.objects.filter(id=self.customer.id).exists())

    def test_add_interaction_action(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('customerprofile-add-interaction', args=[self.customer.id])
        data = {
            'interaction_type': 'whatsapp',
            'subject': 'السؤال عن السعر',
            'content': 'تم الرد'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(CustomerInteraction.objects.filter(customer=self.customer).exists())

    def test_segments_stats_action(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('customerprofile-segments-stats')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)

    def test_tags_assignment(self):
        tag = CustomerTag.objects.create(name='Reviewer', color='#0000FF')
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('customerprofile-detail', args=[self.customer.id])
        self.client.patch(url, {'tags': [tag.id]})
        self.assertTrue(self.customer.tags.filter(id=tag.id).exists())
