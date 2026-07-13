import pytest
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.factories import UserFactory


ACCOUNTS_URL = '/api/accounts/'


@pytest.mark.django_db
class TestLoginView:
    def test_login_succeeds_with_valid_credentials(self, api_client):
        user = UserFactory(username='testuser')
        user.set_password('testpass123')
        user.save()
        response = api_client.post(
            f'{ACCOUNTS_URL}login/',
            {'username': 'testuser', 'password': 'testpass123'},
        )
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert response.data['user']['username'] == 'testuser'

    def test_login_fails_with_wrong_password(self, api_client):
        user = UserFactory(username='testuser')
        user.set_password('testpass123')
        user.save()
        response = api_client.post(
            f'{ACCOUNTS_URL}login/',
            {'username': 'testuser', 'password': 'wrongpass'},
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_fails_with_missing_fields(self, api_client):
        response = api_client.post(f'{ACCOUNTS_URL}login/', {})
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestUserMeView:
    def test_me_returns_current_user_when_authenticated(self, authenticated_client, user):
        response = authenticated_client.get(f'{ACCOUNTS_URL}me/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == user.id
        assert response.data['username'] == user.username

    def test_me_returns_401_when_not_authenticated(self, api_client):
        response = api_client.get(f'{ACCOUNTS_URL}me/')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestTokenRefresh:
    def test_token_refresh_returns_new_access_token(self, api_client, user):
        refresh = RefreshToken.for_user(user)
        response = api_client.post(
            f'{ACCOUNTS_URL}token/refresh/',
            {'refresh': str(refresh)},
        )
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data

    def test_token_refresh_fails_with_invalid_refresh_token(self, api_client):
        response = api_client.post(
            f'{ACCOUNTS_URL}token/refresh/',
            {'refresh': 'invalid-token'},
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
