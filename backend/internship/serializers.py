from rest_framework import serializers
from .models import User, Placement, WeeklyLog, EvaluationForm, FinalGrade

#firrst the users serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta: #this is an inner class i use to provide meta data or configuration data about the main class
        model = User
        fields = ['id','username','email','role']
        #im not including the password fied coz this would expose it 

#now the placement seri
class PlacementSerializer(serializers.ModelSerializer):
    #ive decided to craerte a readonly nested under the user info so front end gets names not just ids
    student = UserSerializer(read_only=True) 
    workplace_supervisor = UserSerializer(read_only=True)
    academic_supervisor = UserSerializer(read_only=True)

    #and i have decide to alllow ids to be writeonly to be used when creating and updating
    #write and read help us send a simple id such as std and receive back to the frontend a full object wit std details
    student_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='STUDENT'),
        write_only=True, source='student'
    )       

    workplace_supervisor_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='WORKPLACE_SUPERVISOR'), 
        write_only = True, source = 'workplace_supervisor', required=False
    )

    academic_supervisor_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='ACADEMIC_SUPERVISOR'),
        write_only=True, source='academic_supervisor', required=False
    )

    class Meta:
        model = Placement
        fields = '__all__'

class WeeklyLogSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)

    class Meta:
        model= WeeklyLog
        fields = '__all__'
        read_only_fields = [
            'student', 'status', 'submitted_at', 'created_at', 'updated_at'
        ]        

#now eavluation form seri
class EvaluationFormSerializer(serializers.ModelSerializer):
    submitted_by = UserSerializer(read_only=True)

    class Meta:
        model = EvaluationForm
        fields = '__all__'
        read_only_fields = [
            'submitted_by', 'status', 'submtted_at', 'created_at'
        ]

#finally fianl grade seri 
class FinalGradeSerializer(serializers.ModelSerializer):
    class Mata:
        model = FinalGrade 
        fields = '__all__'      