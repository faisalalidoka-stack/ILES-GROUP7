"""Django models for the internship app.

This file intentionally stays small and descriptive:
- `User` extends Django's built-in user to add a `role`.
- `WeeklyLog` captures what a student did each week plus a workflow `status`.


"""

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from .constants import (ROLE_CHOICES, LOG_STATUSES,
                        PLACEMENT_STATUSES, 
                        EVAL_STATUSES,
                        VALID_PLACEMENT_TRANSITIONS, 
                        VALID_EVAL_TRANSITIONS, 
                        VALID_LOG_TRANSITIONS )

class User(AbstractUser):
    """Custom user model.

    We add a `role` field to the standard Django user so the rest of the app can
    branch behavior (permissions, dashboards, workflows) based on user type.
    """

    # High-level user type used throughout the app (e.g., STUDENT/COMPANY/ADMIN).
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="STUDENT")

    def __str__(self) -> str:
        return f"{self.username} ({self.role})"


class WeeklyLog(models.Model):
    """A single weekly internship log entry.

    Records what a student worked on in a given week and where that log is in the
    review or approval workflow.
    """

    # Which student this log belongs to.
    student = models.ForeignKey(User,
    on_delete=models.CASCADE,
    limit_choices_to={'role': 'STUDENT'})

    # Week number within the internship period (e.g., 1..12).
    week = models.IntegerField()

    # Free-form summary of tasks completed this week.
    tasks = models.TextField()
    status = models.CharField(max_length=20, choices= LOG_STATUSES, default="Draft")
    placement = models.ForeignKey('Placement', on_delete=models.SET_NULL, null=True, blank=True, related_name='logs')
    hours = models.FloatField(default=0)

    skills = models.TextField(blank=True)
    challenges = models.TextField(blank=True)
    attachment = models.FileField(upload_to = 'log_attachments/', null=True, blank=True)
    supervisor_comment = models.TextField(blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def change_status(self, new_status):
        validate_transition(self.status, new_status, VALID_LOG_TRANSITIONS)
        self.status = new_status
        if new_status == 'Submitted':
            self.submitted_at = timezone.now()
        self.save()
    
    def __str__(self) :
        return f"Week {self.week} - {self.student.username} ({self.status})"
    #this class tells django that the student and week combination must be unique and never duplicate
    class Meta:
        unique_together = ('student','week')
    
class EvaluationForm(models.Model):
    placement = models.ForeignKey('Placement', on_delete=models.CASCADE, related_name='evaluations')
    submitted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='submitted_evaluations')    
    technical_skills = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0),MaxValueValidator(10)]
        ) #this is the score out of 10 for the technical skills of the student
    communication_skills = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(10)]
        ) #this is the score out of 10 for the communication skills of the student
    punctuality = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0),MaxValueValidator(10)]
        ) #this is the score out of 10 for the punctuality of the student
    overall_comments = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=EVAL_STATUSES, default='Draft')
    created_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)

    def change_status(self, new_status):
        validate_transition(self.status, new_status, VALID_EVAL_TRANSITIONS)
        self.status = new_status
        if new_status == 'Submitted':
            self.submitted_at = timezone.now()
        self.save()

    def __str__(self):
        return f"Evaluation for {self.placement} by {self.submitted_by} ({self.status})"

#This is a custom Exception class to handle invalid log transitions
class InvalidStateError(Exception):
    """this is raised when a state transition is invalid""" 
    pass

#This function validates if a transition from current_status to new_status is allowed and if not calls invalidstateerror
def validate_transition(current_status, new_status, valid_transitions):
    allowed = valid_transitions.get(current_status, [])
    if new_status not in allowed:
        raise InvalidStateError(f"canot transition from {current_status} to {new_status} \n Allowed: {allowed}")
    
class Placement(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='placements', limit_choices_to={'role':'STUDENT'} )
    workplace_supervisor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='supervised_placements', limit_choices_to={'role':'WORKPLACE_SUPERVISOR'})
    academic_supervisor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='academic_supervised_placements', limit_choices_to={'role':'ACADEMIC_SUPERVISOR'}) 
    company_name = models.CharField(max_length=255)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=PLACEMENT_STATUSES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    #deadline enforcemennt
    deadline = models.DateField(null=True, blank=True)

    def change_status(self, new_status):
        validate_transition(self.status, new_status, VALID_PLACEMENT_TRANSITIONS)
        self.status = new_status
        self.save()

    def __str__(self):
        return f"{self.student.username} at {self.company_name} ({self.status})"  


class FinalGrade(models.Model):
    placement = models.OneToOneField(Placement, on_delete=models.CASCADE, related_name='final_grade')
    computed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='computed_grades')
    score = models.FloatField(default=0)
    grade_letter = models.CharField(max_length=5, blank=True)
    published = models.BooleanField(default=False)
    computed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Grade for {self.placement.student.username} : {self.grade_letter}" 
    
    def compute_grade_letter(self):
        if self.score >= 70:
            return 'A'
        elif self.score >= 60:
            return 'B'
        elif self.score >= 50:
            return 'C'
        elif self.score >= 40:
            return 'D'
        else:
            return 'F'
        
    def save(self,*args,**kwargs):
        self.grade_letter = self.compute_grade_letter() 
        super().save(*args,**kwargs)  
        


    
    