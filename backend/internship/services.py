from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from internship.models import User 

def login_user(email,password):
    # since we updated models.py to use email as the username_field
    # django's authenticate now looks for the email inside the username parameter
    # so we pass email directly here instead of looking up the username first
    user = authenticate(username=email, password=password)

    if user is None:
        return {
            "success": False,
            "error": "Invalid credentials",
        }
    
    # i now generate the actual jwt tokens
    # this uses the refresh token class from simplejwt
    refresh = RefreshToken.for_user(user)

    # how it looks like
    # we return the access and refresh tokens along with user details
    return {
        'success': True,
        'token': str(refresh.access_token),
        'refresh_token': str(refresh), # this is the one that allows the user to stay logged in
        'user': {
            'id': user.id,
            'email': user.email,
            'role': user.role,
        }
    }