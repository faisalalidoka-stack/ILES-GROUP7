from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Placement, WeeklyLog,EvaluationForm, FinalGrade
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('Role Info', {'fields': ('role',)}),)
    
@admin.register(Placement)
class PlacementAdmin(admin.ModelAdmin):
    list_display =('student', 'company_name', 'status', 'created_at')
    list_filter = ('status',)
        
@admin.register(WeeklyLog)
class WeeklyLogAdmin (admin.ModelAdmin):
    list_display = ('student', 'week', 'status', 'submitted_at')
    list_filter = ('status',)

@admin.register(EvaluationForm)
class EvaluationFormAdmin(admin.ModelAdmin):
    list_display = ('placement','submitted_by', 'status')
    list_filter = ('status',)    

@admin.register(FinalGrade)
class FinalGradeAdmin(admin.ModelAdmin):
    list_display = ('placement', 'score', 'grade_letter', 'published')
# Register your models here.
