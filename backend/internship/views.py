from django.shortcuts import render

from .permsissions import IsStudentOnly, IsWorkplaceSupervisorOnly, IsAcademicSupervisorOnly
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import User, Placement, WeeklyLog, EvaluationForm, FinalGrade
from .serializers import (
    PlacementSerializer, WeeklyLogSerializer, EvaluationFormSerializer, FinalGradeSerializer,
    RegisterSerializer,
)
from .services import login_user
#i added thse to make our forgot password safer by using djangos built in
#token generator and email functionality
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
# Create your views here.

#We use DRF's APIView class so weget JSON parsing authentication checking and error formatting for free

#we start with the login end point
class LoginView(APIView):
    permission_classes = [AllowAny] #means no token needed to login here

    def post(self, request):
        email = request.data.get('email','')
        password = request.data.get('password','')

        result = login_user(email, password)

        if not result['success']:
            return Response(
                {'message':result['error']},
                status=status.HTTP_401_UNAUTHORIZED #this is what is shown to a suser we dont confirm after entering thir creds

            )
        return Response(result, status=status.HTTP_200_OK) #200 will mean everything good the credentials match
    
#now the placement, weeklog and eavl end points
class PlacementListView(APIView):
    permission_classes = [IsAuthenticated] #is the person authentiacrted to acces this window

    def get(self, request):
        role = request.user.role
        if role == 'STUDENT':
            qs = Placement.objects.filter(student=request.user)
        elif role == 'WORKPLACE_SUPERVISOR':
            qs = Placement.objects.filter(workplace_supervisor=request.user)
        elif role == 'ACADEMIC_SUPERVISOR':
            qs = Placement.objects.filter(academic_supervisor=request.user)
        else:
            qs = Placement.objects.all()
        return Response(PlacementSerializer(qs, many=True).data)

    def post(self, request): #now here the admin creates a palcement
        s = PlacementSerializer(data=request.data)
        if s.is_valid():
            s.save()
            return Response(s.data,status=status.HTTP_201_CREATED)
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)
    
class PlacementDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Placement.objects.get(pk=pk)
        except Placement.DoesNotExist:
            return None
        
    def get(self, request, pk):
        obj = self.get_object(pk)
        if not obj:
            return Response({'error': 'Not found'}, status=404)
        return Response(PlacementSerializer(obj).data)

    def patch(self, request, pk): #here we cahnge the ststus
        obj = self.get_object(pk)
        if not obj:
            return Response({'error': 'NOT found'}, status=404)
        new_status = request.data.get('status')    

        if new_status:
            try :
                obj.change_status(new_status)
            except Exception as e:
                return Response({'error':str(e)}, status=400)
        s = PlacementSerializer(obj, data=request.data, partial=True)
        if s.is_valid():
            s.save()
        return Response(PlacementSerializer(obj).data) 


#now the weeklylog endpoint
class WeeklyLogListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        role = request.user.role
        if role == 'STUDENT':
            qs = WeeklyLog.objects.filter(
                student=request.user
            )
        elif role == 'WORKPLACE_SUPERVISOR':
            qs = WeeklyLog.objects.filter(
                placement__workplace_supervisor=request.user
            )
        else:
            qs = WeeklyLog.objects.all()
        return Response(WeeklyLogSerializer(qs, many=True).data)

    def post(self, request): #when the student create a new log 
        s = WeeklyLogSerializer(data=request.data)
        if s.is_valid():
            s.save(student=request.user)
            return Response(s.data, status=201)
        return Response(s.errors, status=400)

#now to view the details of the weely log
class WeeklyLogDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return WeeklyLog.objects.get(pk=pk)
        except WeeklyLog.DoesNotExist:
            return None

    def get(self, request, pk):
        obj = self.get_object(pk)
        if not obj: 
            return Response({'error':'Not found'}, status=404)
        return Response(WeeklyLogSerializer(obj).data)

    def patch(self, request, pk): #this is where we submit then approve or reject the weekly log
        obj = self.get_object(pk)
        if not obj:
            return Response({'error':'Not found'}, status=404)
        new_status = request.data.get('status')
        if new_status:
            try:
                obj.change_status(new_status)
            except Exception as e:
                return Response({'error': str(e)}, status=400)
            
        s = WeeklyLogSerializer(obj, data=request.data, partial=True)
        if s.is_valid():
            s.save()
        return Response(WeeklyLogSerializer(obj).data)  

#then for theeavluations end points
class EvaluationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = EvaluationForm.objects.filter(
            placement__workplace_supervisor=request.user
        )
        return Response(EvaluationFormSerializer(qs, many=True).data)
        
    def post(self, request):
        s = EvaluationFormSerializer(data=request.data)
        if s.is_valid():
            s.save(submitted_by= request.user)
            return Response(s.data, status=201)
        return Response(s.errors, status=400)
        
 #and finally the final grade endpoint
class FinalGradeView(APIView):
    permission_classes= [IsAuthenticated]

    def get(self, request):
        qs = FinalGrade.objects.filter(
            placement__student=request.user,
            published=True
        )       
        return Response(FinalGradeSerializer(qs, many=True).data)
    
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        s = RegisterSerializer(data=request.data)
        if s.is_valid():
            user = s.save()
            return Response({
                'success': True,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'role': user.role,
                }
            }, status=201)
        return Response({'success': False, 'errors': s.errors}, status=400)
#this first view is for the user to request for the link to reset their password   
class RequestPasswordResetView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '')
        try:
            user = User.objects.get(email=email)
            
            #this enerates the security tokens its in built in djang0
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            #this is the link we send to the user
            #it enables them to strt the reset process
            reset_link = f"http://localhost:3000/reset-password/{uid}/{token}/"
            
            #we now send then an email with the reset password link
            send_mail(
                subject="Password Reset Request",
                message=f"Click the link below to reset your password:\n{reset_link}",
                from_email="noreply@yourapp.com",
                recipient_list=[email],
                fail_silently=False,
            )

            return Response({
                'success': True,
                'message': 'A reset link has been sent to your email check'
            }, status=200)

        except User.DoesNotExist:
            #we return success even if the usr doesnt exist for security reasons
            #we dont want to reveal if an email is registered or not to potential attackers
            return Response({
                'success': True, 
                'message': 'A reset link has been sent to your email check'
            }, status=200)
#this view is for the user to actually change their password 
#after they click the link in their email they rea then directed to apgec
#where they can change their password
class ConfirmPasswordResetView(APIView):
    permission_classes = [AllowAny]
    #thse are ibuilt in django i jsut reseached how to use them and implemented them here
    def post(self, request):
        uidb64 = request.data.get('uid', '')
        token = request.data.get('token', '')
        new_password = request.data.get('new_password', '')
        confirm_password = request.data.get('confirm_password', '')

        #this is the basic validation
        if new_password != confirm_password:
            return Response({'error': 'Passwords do not match'}, status=400)
        
        if len(new_password) < 8:
            return Response({'error': 'Password must be at least 8 characters'}, status=400)

        try:
            #here we decode the user id and find the user in our db i dont completely understand these
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        #we now check ifthe token is valid for this specific user
        if user is not None and default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response({'success': True, 'message': 'Password reset successful'}, status=200)
        
        return Response({'error': 'The reset link is invalid or has expired please try again.'}, status=400)
    
class WeeklyLogListView(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsStudentOnly()]
            return [IsAuthenticated()]
        
        