"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView

from internship.views import (
    
    #RegisterView,ForgotPasswordView, 
    EvaluationDetailView,
    FinalGradeCreateView,
    RegisterView,
    RequestPasswordResetView,
    ConfirmPasswordResetView,
    LoginView,
    PlacementListView, PlacementDetailView,
    WeeklyLogListView, WeeklyLogDetailView,
    EvaluationListView, FinalGradeView,
)
#this is for admin as always
urlpatterns = [
    path('admin/', admin.site.urls),
    #for authentiction
    #i decided to add the forgot password and regiater views here
    #because they are related to the user management and auth process
    path('register/', RegisterView.as_view(), name='register'),
    path('auth/password-reset-request/', RequestPasswordResetView.as_view(), name='password-reset-request'),
    path('auth/password-reset-confirm/', ConfirmPasswordResetView.as_view(), name='password-reset-confirm'),

    path('login/', LoginView.as_view(), name='login'),
    #fro the placements
    path('placements/', PlacementListView.as_view(), name='placement-list'),
    #and fo the details of the placemnt
    path('placements/<int:pk>/', PlacementDetailView.as_view(), name='placement-detail'),

    #now the weekly logs
    path('logs/', WeeklyLogListView.as_view(), name='weeklylog-list'),
    #and their details
    path('logs/<int:pk>/', WeeklyLogDetailView.as_view(), name='weeklylog-detail'),

    #for the token refresh
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    #for the evaluations
    path('evaluations/', EvaluationListView.as_view(), name='evaluation-list'),
    path('evaluations/<int:pk>/', EvaluationDetailView.as_view(), name='evaluation-detail'),

    #now the final grade
    path('grades/', FinalGradeView.as_view(), name='final-grade'),
    path('grades/create/',FinalGradeCreateView.as_view(), name='grade-create'),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
