from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Placement, WeeklyLog, EvaluationForm, FinalGrade

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'role', 'is_staff') # Put email first!
    
    # This controls the edit page
    fieldsets = UserAdmin.fieldsets + (
        ('Role Info', {'fields': ('role',)}),
    )
    
    # This controls the "Add User" page - ensures you can type the email
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('email', 'role')}),
    )

# DELETE THIS LINE: admin.site.register(User, CustomUserAdmin) 
# (The @admin.register decorator at the top already did this!)

@admin.register(Placement)
class PlacementAdmin(admin.ModelAdmin):
    list_display = ('student', 'company_name', 'status', 'created_at')
    list_filter = ('status',)
        
@admin.register(WeeklyLog)
class WeeklyLogAdmin(admin.ModelAdmin):
    list_display = ('student', 'week', 'status', 'submitted_at')
    list_filter = ('status',)

@admin.register(EvaluationForm)
class EvaluationFormAdmin(admin.ModelAdmin):
    list_display = ('placement', 'submitted_by', 'status')
    list_filter = ('status',)    

@admin.register(FinalGrade)
class FinalGradeAdmin(admin.ModelAdmin):
    list_display = ('placement', 'score', 'grade_letter', 'published')
# Register your models here.
