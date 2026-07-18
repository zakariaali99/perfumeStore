import requests

# 1. Login to get token
url_login = 'http://localhost:8000/api/accounts/login/'
# We don't have user credentials, but we can bypass login or create a superuser and get a token via django shell!
