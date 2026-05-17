from rest_framework import permissions

class IsRecruiter(permissions.BasePermission):
    """
    Allows access only to users with the 'RECRUITER' role.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            getattr(request.user, 'role', '') == 'RECRUITER'
        )

class IsStudent(permissions.BasePermission):
    """
    Allows access only to users with the 'STUDENT' role.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            getattr(request.user, 'role', '') == 'STUDENT'
        )

class IsRecruiterOrReadOnly(permissions.BasePermission):
    """
    Allows write access only to recruiters. Everyone can read.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (getattr(request.user, 'role', '') == 'RECRUITER' or request.user.is_staff)
        )
