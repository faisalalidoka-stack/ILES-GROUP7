"""
serializers.py — Django REST Framework serializers for the internship app.
 
Serializers sit between the database models and the API.
They do two things:
  1. OUTPUT  — convert a model object into JSON so the frontend can read it.
  2. INPUT   — validate and clean JSON sent by the frontend before saving to the DB.
 
Each serializer maps to one model in models.py.
"""


from rest_framework import serializers
from .models import User, Placement, WeeklyLog, EvaluationForm, FinalGrade, LogReview, Notification, Flag

class RegisterSerializer(serializers.ModelSerializer):
    """
    Handles new user registration.
 
    Accepts username, email, password, confirm_password, and role.
    Passwords are write-only — they are never sent back in a response.
    """
    
    # min_length=8 enforces the 8-character password rule at the API level
    password = serializers.CharField(write_only=True, min_length=8)
    # A second password field used only to confirm the user typed the same thing twice
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        # These are the only fields accepted during registration
        fields = ['username', 'email', 'password', 'confirm_password', 'role']

    def validate(self, data):
        """
        Cross-field validation: checks that password and confirm_password match.
 
        `data` is a dictionary of all submitted fields.
        Raises a ValidationError if the two passwords differ,
        which sends a 400 Bad Request back to the frontend.
        """
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match."}
            )
        return data

    def create(self, validated_data):
        """
        Creates and saves a new User after validation passes.
 
        confirm_password is removed first because the User model
        does not have that field — it was only needed for validation.
        create_user() hashes the password before storing it (never plain text).
        """
        validated_data.pop('confirm_password')  # Remove confirm_password before creating the user
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'STUDENT'),
        )  # Default to STUDENT if role is not provided


# first the users serializer
class UserSerializer(serializers.ModelSerializer):
    """
    Converts a User object into JSON for API responses.
 
    Used as a nested serializer inside other serializers
    (e.g. showing full student details inside a placement response).
    Password is intentionally excluded — never expose it in a response.
    """
    class Meta:
        model = User
        # Only safe, non-sensitive fields are included
        fields = ['id', 'username', 'email', 'role', 'profile_picture']


# MOVED UP: FinalGradeSerializer must be defined before PlacementSerializer
# because PlacementSerializer references it as a nested field.
# Python reads top-to-bottom — using a class before it is defined causes a NameError.
class FinalGradeSerializer(serializers.ModelSerializer):
    """
    Serializes FinalGrade records for API responses.
 
    The score and grade_letter are auto-computed in the model's
    save() method, so the frontend only reads them — never writes them.

    FIX: Added 'placement' to fields so FinalGradeView (admin GET /grades/)
    can serialize the full record without crashing. Previously the missing
    placement field caused a 500 when the admin tried to list all grades.
    """
    class Meta:
        model = FinalGrade
        fields = [
            'id', 'placement', 'grade_letter', 'academic_score',
            'published', 'remarks', 'computed_at'
        ]


# now the placement serializer
class PlacementSerializer(serializers.ModelSerializer):
    """
    Handles reading and writing of Placement records.
 
    Uses a dual read/write pattern for related users:
    - READ  → returns a full nested object (e.g. student's name, email, role)
    - WRITE → accepts just an integer ID (e.g. student_id: 5)
 
    This way the frontend receives rich data but only needs to send an ID when creating.

    FIX: final_grade is now a SerializerMethodField instead of a plain nested
    FinalGradeSerializer field. The reason: final_grade is a reverse OneToOne
    relation — if no grade has been created for a placement yet, accessing
    obj.final_grade raises RelatedObjectDoesNotExist, which crashed the
    serializer with a 500. SerializerMethodField lets us catch that exception
    and return None instead, so placements without a grade serialize safely.
    """
 
    # READ-ONLY nested objects — returned in GET responses
    student = UserSerializer(read_only=True)
    workplace_supervisor = UserSerializer(read_only=True)
    academic_supervisor = UserSerializer(read_only=True)

    # FIX: changed from FinalGradeSerializer(read_only=True) to SerializerMethodField
    # so we can safely handle placements that have no final grade yet.
    final_grade = serializers.SerializerMethodField()

    def get_final_grade(self, obj):
        """
        Returns the serialized FinalGrade for this placement, or None if it
        doesn't exist yet. Using try/except here prevents RelatedObjectDoesNotExist
        from bubbling up as a 500 when the placement has no associated grade.
        """
        try:
            return FinalGradeSerializer(obj.final_grade).data
        except Exception:
            return None

    # WRITE-ONLY ID fields — accepted in POST/PUT/PATCH requests
    student_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='STUDENT'),
        write_only=True, source='student'
    )

    workplace_supervisor_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='WORKPLACE_SUPERVISOR'),
        write_only=True, source='workplace_supervisor', required=False
    )

    academic_supervisor_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='ACADEMIC_SUPERVISOR'),
        write_only=True, source='academic_supervisor', required=False, allow_null=True
    )

    class Meta:
        model = Placement
        fields = '__all__'

    def validate(self, data):
        """
        Business-rule validation for placement dates.
 
        Two checks are performed:
        1. End date must be after start date.
        2. The student must not already have an active/pending placement
           whose dates overlap with the new one.
 
        Overlap logic: two ranges [A_start, A_end] and [B_start, B_end]
        overlap when A_start <= B_end AND A_end > B_start.
 
        self.instance is set when updating an existing record (PUT/PATCH),
        and None when creating a new one (POST). We exclude the current
        record from the overlap check so an update doesn't conflict with itself.
        """
        student = data.get('student')
        start_date = data.get('start_date')
        end_date = data.get('end_date')

        # Check 1: date order
        if start_date and end_date and start_date >= end_date:
            raise serializers.ValidationError({
                "end_date": "End date must be after start date."
            })

        # Check 2: overlapping placements for the same student
        if student and start_date and end_date:
            # When updating, exclude the placement being edited from the overlap search
            instance_id = self.instance.id if self.instance else None
            overlapping = Placement.objects.filter(
                student=student,
                start_date__lte=end_date,   # existing starts before new one ends
                end_date__gt=start_date,    # existing ends after new one starts
                status__in=['Pending', 'Active']
            ).exclude(id=instance_id)

            if overlapping.exists():
                conflict = overlapping.first()
                raise serializers.ValidationError({
                    "start_date": (
                        f"This student already has a placement at {conflict.company_name} "
                        f"from {conflict.start_date} to {conflict.end_date}. "
                        f"Dates must not overlap."
                    )
                })

        return data


class WeeklyLogSerializer(serializers.ModelSerializer):
    """
    Handles reading and writing of WeeklyLog records.
 
    The student field is a read-only nested object so responses
    include the student's name and role, not just their ID.
 
    read_only_fields prevents the frontend from overriding
    system-managed fields like status, timestamps, and the student link —
    those are set by the backend, not the user.
    """
    student = UserSerializer(read_only=True)

    class Meta:
        model = WeeklyLog
        fields = '__all__'
        read_only_fields = ['student', 'status', 'submitted_at', 'created_at', 'updated_at']


class EvaluationFormSerializer(serializers.ModelSerializer):
    """
    Handles reading and writing of EvaluationForm records.
 
    submitted_by is read-only so supervisors cannot impersonate
    each other — the backend assigns it automatically from the
    logged-in user in the view.
    """
    # Read-only nested object: responses show full supervisor details, not just an ID
    submitted_by = UserSerializer(read_only=True)

    class Meta:
        model = EvaluationForm
        fields = '__all__'
        read_only_fields = [
            'submitted_by', 'status', 'submitted_at', 'created_at'
        ]


class LogReviewSerializer(serializers.ModelSerializer):
    """
    Handles reading and writing of LogReview records.
 
    supervisor is read-only — the backend assigns it from
    the logged-in user, preventing supervisors from reviewing
    under someone else's name.
    """
    # Nested read-only: responses include the supervisor's full details
    supervisor = UserSerializer(read_only=True)

    class Meta:
        model = LogReview
        fields = '__all__'
        read_only_fields = ['supervisor', 'reviewed_at']


class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializes Notification records sent to users.
 
    recipient and created_at are read-only — notifications
    are created by the system, not manually submitted by users.
    """
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['recipient', 'created_at']


class FlagSerializer(serializers.ModelSerializer):
    """
    Handles reading and writing of Flag records.
 
    raised_by is read-only — assigned automatically from
    the logged-in user so flags cannot be falsely attributed.
    """
    # Nested read-only: responses show who raised the flag
    raised_by = UserSerializer(read_only=True)

    class Meta:
        model = Flag
        fields = '__all__'
        read_only_fields = ['raised_by', 'created_at']
