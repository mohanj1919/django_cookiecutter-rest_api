from rest_framework import permissions


class CustomDjangoModelPermissions(permissions.DjangoModelPermissions):

    perms_map = {
        'GET': ['%(app_label)s.get_%(model_name)s'],
        'OPTIONS': [],
        'HEAD': [],
        'POST': ['%(app_label)s.add_%(model_name)s'],
        'PUT': ['%(app_label)s.change_%(model_name)s'],
        'PATCH': ['%(app_label)s.change_%(model_name)s'],
        'DELETE': ['%(app_label)s.delete_%(model_name)s'],
    }

class IsOwner(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to edit it.
    Assumes the model instance has an `owner` attribute.
    """
    def has_object_permission(self, request, view, obj):
        def has_object_permission(self, request, view, obj):
            if request.user.is_staff:
                return True

        return obj == request.user

