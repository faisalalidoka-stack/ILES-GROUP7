from rest_framework import serializers
from .models import User, Placement, WeeklyLog, EvaluationForm, FinalGrade, LogReview, Notification, Flag

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirm_password', 'role']
        def validate(self, data):
            if data['password'] != data['confirm_password']:
                raise serializers.ValidationError(
                     {"confirm password": "Passwords do not match."}
                    )
            return data
         def create(self, validated_data):
            validated_data.pop('confirm_password')  # Remove confirm_password before creating the user
            return User.objects.create_user(
                username=validated_data['username'],
                email=validated_data['email'],
                password=validated_data['password'],
                role=validated_data.get('role', 'STUDENT'),
              )  # Default to STUDENT if role is not provided)

#first the users serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta: #this is an inner class i use to provide meta data or configuration data about the main class
        model = User
        fields = ['id','username','email','role','profile_picture']

        #im not including the password fied coz this would expose it 

#now the placement serializer
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
        write_only=True, source='academic_supervisor', required=False, allow_null=True
    )

    class Meta:
        model = Placement
        fields = '__all__'

        def validate(self, data):
"""Prevent a student from having two placements with overlapping date ranges.
Runs errors saving - raises ValidateError if overlap detected.
Overlap logic: two date ranges [A_start, A_end] and [B_start, B_end] overlap if: A_start <= B-end AND A_end >=B_start"""
            student = data.get('student')
            start_date = data.get('start_date')
            end_date = data.get('end_gate')
        #Basic date order check    
            if start_date and end_date and start_date >=end_date:
                raise serializers.ValidationError({
                    "end_date": "End date must be after start date."
                 })
            if student and start_date and end_date:
    #Exclude the current instance when updating (not just creating)
                instance_id - self.instance.id if self.instance else None 
                overlapping = Placement.objects.filter(
                    student = student,
                    start_date__It=end_date, #existing starts before new one ends
                    end_date__gt=start_date, #existing ends after new one starts
                    status__in=['Pending', 'Active'] #only check active placements
                ).exclude(id=instance_id)
            if overlapping.exists():
                conflict = overlapping.first()
                raise serializers.ValidationError({
                    "start_date": (
                        f"This student already has a placement at {conflict.company_name}"
                        f"from {conflict.start_date} to {conflict.end_date}."
                        f"Dates must not overlap."
                    )
                })
        return data 




class WeeklyLogSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)

    class Meta:
        model= WeeklyLog
        fields = '__all__'
        read_only_fields = [ 'student', 'status', 'submitted_at', 'created_at', 'updated_at']        

#now eavluation form seri
class EvaluationFormSerializer(serializers.ModelSerializer):
    submitted_by = UserSerializer(read_only=True)

    class Meta:
        model = EvaluationForm
        fields = '__all__'
        read_only_fields = [
            'submitted_by', 'status', 'submitted_at', 'created_at'
        ]

#finally final grade serializers 
class FinalGradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinalGrade 
        fields = '__all__'

class LogReviewSerializer(serializers.ModelSerializer):
    supervisor = UserSerializer(read_only=True)

    class Meta:
        model = LogReview
        fields = '__all__'
        read_only_fields = ['supervisor', 'reviewed_at']  

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['recipient', 'created_at']

class FlagSerializer9serializers.ModelSerializer):
    raised_by = UserSerializer(read_only=True)

    class Meta:
        model = Flag
        fields = '__all__'
        read_only_fields = ['raised_by', 'created_at']


