from django.db import models
from django.contrib.auth.models import AbstractUser
from . constants import ROLE_CHOICES, LOG_STATUSES

# Create your models here.
class User(AbstractUser):
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default ='STUDENT')
    
    def __str__(self):
        return f"{self.username} ({self.role})"
    
class WeeklyLog(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    week = models.IntegerField()
    tasks = models.TextField()
    status = models.CharField(max_length=20, choices= LOG_STATUSES, default="Draft")
    
    def __str__(self):
        return f"Week {self.week} - {self.student.username} ({self.status})"
    
    
