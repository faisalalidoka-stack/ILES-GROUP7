from rest_framework.permissions import BasePermission

class IsStudrntOnly(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'STUDENT')

class IsWorkplaceSupervisorOnly(BasePermission):
    def has_permsission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'WORKPLACE_SUPERVISOR')
    
class IsAdminOnly(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role =='INTERNSHIP_ADMIN')
    
