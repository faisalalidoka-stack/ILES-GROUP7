from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from internship.models import User 
def login_user(email,password):
    #im first trying to find the user by their email
    try:
        user_object = User.objects.get(email=email)
        username = user_object.username
    #of course there is a possibility of the user not existing    
    except User.DoesNotExist:
        return {
            "success": False, #i set success to false then return error
            "error" : "Invalid credentials",
        }
    
    #i now authenticate with the username and pasword 
    #this feature comes with djang
    user = authenticate(username=username, password=password)

    if user is None:
        return {
            "success": False,
            "error": "Invalid credentials",
        }
    
    #i now generate the actual JWT tokens
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)

    #how it looks like
    return {
        'success': True,
        'token': str(refresh.access_token),
        'refresh_token': str(refresh), #this is the one that allows the user to stay logged in
        'user': {
            'id': user.id,
            'email': user.email,
            'role': user.role,

        }
    }

