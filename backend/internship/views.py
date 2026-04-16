from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Placement, WeeklyLog, EvaluationForm, FinalGrade
from .serializers import (
    PlacementSerializer, WeeklyLogSerializer, EvaluationFormSerializer, FinalGradeSerializer,
)
from .services import login_user
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
            Placement_workplace_supervisor=request.user
        )
        return Response(EvaluationFormSerializer(qs, mant=True).data)
        
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
            Placement_student=request.user,
            published=True
        )       
        return Response(FinalGradeSerializer(qs, many=True).data)