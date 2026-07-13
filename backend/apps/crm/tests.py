import pytest
from django.db import IntegrityError
from django.utils import timezone
from datetime import timedelta
from rest_framework import status

from crm.models import CustomerProfile, CustomerInteraction, CustomerTag
from crm.factories import (
    CustomerProfileFactory,
    CustomerInteractionFactory,
    CustomerTagFactory,
)


pytestmark = pytest.mark.django_db

CRM_URL = '/api/crm/'


def test_customer_profile_unique_together_enforces_uniqueness():
    """The (name, phone) unique_together constraint must reject duplicates."""
    CustomerProfileFactory(name='Ahmed Ali', phone='0912345678')

    with pytest.raises(IntegrityError):
        CustomerProfileFactory(name='Ahmed Ali', phone='0912345678')


def test_admin_can_list_customer_profiles(admin_client):
    """Authenticated admin users can list customer profiles."""
    CustomerProfileFactory.create_batch(3)

    response = admin_client.get(f'{CRM_URL}customers/')

    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] == 3


def test_anonymous_cannot_list_customer_profiles(api_client):
    """Anonymous users cannot list customer profiles."""
    CustomerProfileFactory.create_batch(2)

    response = api_client.get(f'{CRM_URL}customers/')

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_customer_profile_queryset_annotates_interactions_count(admin_client):
    """The CustomerProfile queryset annotates interactions_count correctly."""
    customer = CustomerProfileFactory()
    CustomerInteractionFactory.create_batch(2, customer=customer)

    response = admin_client.get(f'{CRM_URL}customers/{customer.id}/')

    assert response.status_code == status.HTTP_200_OK
    assert response.data['interactions_count'] == 2


def test_add_interaction_creates_interaction_for_url_customer(admin_client):
    """add_interaction creates an interaction linked to the URL customer."""
    customer = CustomerProfileFactory()
    payload = {
        'interaction_type': 'call',
        'subject': 'Follow up',
        'content': 'Test call content',
    }

    response = admin_client.post(
        f'{CRM_URL}customers/{customer.id}/add_interaction/',
        payload,
        format='json',
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['customer'] == customer.id
    assert CustomerInteraction.objects.filter(customer=customer).count() == 1


def test_add_interaction_ignores_client_supplied_customer_field(admin_client):
    """add_interaction must ignore a client-supplied customer field."""
    url_customer = CustomerProfileFactory()
    other_customer = CustomerProfileFactory()
    payload = {
        'interaction_type': 'note',
        'subject': 'Note subject',
        'content': 'Note content',
        'customer': other_customer.id,
    }

    response = admin_client.post(
        f'{CRM_URL}customers/{url_customer.id}/add_interaction/',
        payload,
        format='json',
    )

    assert response.status_code == status.HTTP_201_CREATED
    interaction = CustomerInteraction.objects.get(id=response.data['id'])
    assert interaction.customer_id == url_customer.id
    assert interaction.customer_id != other_customer.id


def test_created_by_name_is_null_safe_when_no_created_by(admin_client):
    """created_by_name returns None when the interaction has no created_by."""
    interaction = CustomerInteractionFactory(created_by=None)

    response = admin_client.get(f'{CRM_URL}interactions/{interaction.id}/')

    assert response.status_code == status.HTTP_200_OK
    assert response.data['created_by_name'] is None


def test_admin_can_create_update_delete_tags(admin_client):
    """Admin users have full CRUD access on customer tags."""
    create_payload = {'name': 'VIP', 'color': '#FF0000'}
    response = admin_client.post(f'{CRM_URL}tags/', create_payload, format='json')
    assert response.status_code == status.HTTP_201_CREATED
    tag_id = response.data['id']

    response = admin_client.patch(
        f'{CRM_URL}tags/{tag_id}/',
        {'name': 'VIP Updated'},
        format='json',
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.data['name'] == 'VIP Updated'

    response = admin_client.delete(f'{CRM_URL}tags/{tag_id}/')
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert CustomerTag.objects.filter(id=tag_id).count() == 0


def test_admin_can_list_update_delete_interactions(admin_client):
    """Admin users can list, update and delete customer interactions."""
    interaction = CustomerInteractionFactory()

    response = admin_client.get(f'{CRM_URL}interactions/')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] == 1

    response = admin_client.patch(
        f'{CRM_URL}interactions/{interaction.id}/',
        {'subject': 'Updated subject'},
        format='json',
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.data['subject'] == 'Updated subject'

    response = admin_client.delete(f'{CRM_URL}interactions/{interaction.id}/')
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert CustomerInteraction.objects.filter(id=interaction.id).count() == 0


def test_customer_ordering_is_by_created_at_descending(admin_client):
    """Customer profiles are ordered by -created_at."""
    now = timezone.now()

    oldest = CustomerProfileFactory()
    CustomerProfile.objects.filter(pk=oldest.pk).update(created_at=now - timedelta(days=2))

    middle = CustomerProfileFactory()
    CustomerProfile.objects.filter(pk=middle.pk).update(created_at=now - timedelta(days=1))

    newest = CustomerProfileFactory()
    CustomerProfile.objects.filter(pk=newest.pk).update(created_at=now)

    response = admin_client.get(f'{CRM_URL}customers/')

    assert response.status_code == status.HTTP_200_OK
    ids = [customer['id'] for customer in response.data['results']]
    assert ids == [newest.id, middle.id, oldest.id]
