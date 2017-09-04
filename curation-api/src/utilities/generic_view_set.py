from rest_framework import permissions, viewsets, generics

from .permissions import CustomDjangoModelPermissions, IsOwner


class GenericViewSet(viewsets.GenericViewSet):
    curator_allowed_actions = []

    @staticmethod
    def _is_curator(user):
        if user is None:
            return False
        elif not user.is_authenticated:
            return False
        user_group = user.groups.first()
        return user_group.name == 'curator'

    def get_permissions(self):
        permission_classes = (permissions.IsAuthenticated, )
        user = self.request.user
        if GenericViewSet._is_curator(user) and (self.action in self.curator_allowed_actions):
            permission_classes = permission_classes + (IsOwner, )
        else:
            permission_classes = permission_classes + (CustomDjangoModelPermissions, )
        view_permissions = [permission() for permission in permission_classes]
        return view_permissions


class CustomGenericAPIView(generics.GenericAPIView):
    curator_allowed_actions = []

    @staticmethod
    def _is_curator(user):
        if user is None:
            return False
        elif not user.is_authenticated:
            return False
        user_group = user.groups.first()
        return user_group.name == 'curator'

    def get_permissions(self):
        permission_classes = (permissions.IsAuthenticated, )
        user = self.request.user
        if CustomGenericAPIView._is_curator(user) and (self.action in self.curator_allowed_actions):
            permission_classes = permission_classes + (IsOwner, )
        else:
            permission_classes = permission_classes + (CustomDjangoModelPermissions, )
        view_permissions = [permission() for permission in permission_classes]
        return view_permissions