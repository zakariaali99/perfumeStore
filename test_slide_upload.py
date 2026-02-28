import requests
import os

API_URL = "http://localhost:8000/api/cms/slides/"

# First get a valid token (superuser)
login_data = {
    "username": "admin",
    "password": "password" # just guessing, assuming user has token or we can just bypass auth for local test? Wait, admin is IsAdminUser
}

# Instead, let's create a management command or a simple script using django environment
