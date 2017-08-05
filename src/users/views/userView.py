
from datetime import datetime, timedelta

import pyotp
import logging
from django.conf import settings
from django.contrib.auth.models import Group
from django.core import serializers as jsonSerializer
from django.core.paginator import Paginator
from django.db.models import Q
from django.db.models.functions import Lower
from rest_framework import generics, mixins, pagination, permissions, status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, authentication_classes, detail_route, list_route, permission_classes
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from ...users.auth_backend import EmailBackend
from ...utilities import ListModelViewMixin
from ..models import CurationUser
from ..serializers.userSerializer import (
    ChangePasswordSerializer,
    CreateUserSerializer,
    GroupSerializer,
    UpdateProfileSerializer,
    UserSerializer
)
from ..utils import SendEmailUtil, get_totp_instance


# Get an instance of a logger
logger = logging.getLogger(__name__)

class UserViewSet(mixins.RetrieveModelMixin,
                  ListModelViewMixin,
                  viewsets.GenericViewSet):
    """
    A viewset that provides the Get, Update and Delete actions on User model
    """

    def get_serializer_class(self):
        if self.action == 'create' or self.action == 'update':
            return CreateUserSerializer
        return UserSerializer

    queryset = CurationUser.objects.filter(is_deleted=False)
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)
    model = CurationUser

    def get_queryset(self):
        queryset = self.queryset.exclude(email=self.request.user.email)
        queryset = queryset.filter(is_deleted=False)
        return queryset

    def filter_query_set(self, search_param):
        query = Q(email__icontains=search_param) | Q(
            first_name__icontains=search_param) | Q(
                last_name__icontains=search_param) | Q(
                    groups__name__icontains=search_param) | Q(phone_number__icontains=search_param) | Q(
                        mfa_type__icontains=search_param
                    )
        queryset = self.get_queryset()
        return queryset.filter(query)

    def destroy(self, request, pk=None):
        instance = self.get_object()
        loggedInUser = request.user
        if instance.id == loggedInUser.id:
            return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
        instance.is_active = False
        instance.is_deleted = True
        instance.deleted_on = datetime.now().isoformat()
        instance.deleted_by = instance.email
        instance.save()
        # delete api auth token associated with the user
        self._delete_auth_token_(instance.id)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        createdUser = self._perform_create(serializer)
        userData = UserSerializer(createdUser).data
        SendEmailUtil().generate_reset_password_link(
            createdUser, 'welcomeEmailTemplate.html', settings.WELCOME_MAIL_SUBJECT)
        return Response(userData, status=status.HTTP_201_CREATED)

    def _perform_create(self, serializer):
        data = self.request.data

        if "groups" not in data:
            raise ValidationError({
                "groups": "No group provided",
            })

        try:
            groupId = data["groups"][0]
            logger.info('getting group: %d details', groupId)
            group = Group.objects.get(id=groupId)
        except Group.DoesNotExist:
            return Response(
                '({0}) group not found'.format(groupId),
                status=status.HTTP_400_BAD_REQUEST
            )

        user = serializer.save()
        logger.info('saved user detials')

        user.groups.set([group])
        logger.info('assigned user to a group')
        return user

    def update(self, request, pk=None):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.save()
        userData = UserSerializer(user).data
        return Response(userData, status=status.HTTP_200_OK)

    @detail_route(methods=['post'])
    def update_profile(self, request, pk=None):
        user = self.get_object()
        data = request.data
        serializer = UpdateProfileSerializer(user, data=data)
        password = data.get('change_password', None)

        if password is not None:
            if not request.user.check_password(password.get('old_password')):
                raise ValidationError({'errors': {
                    "currentpassword": ["Invalid Password."]
                }})

            if password.get('new_password') != password.get('confirm_new_password'):
                raise ValidationError({'errors': {
                    "confirm_new_password": ['new_password and confirm_new_password does not match.']
                }})

        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(status=status.HTTP_200_OK)

    @list_route()
    def get_roles(self, request):
        roles = Group.objects.all()
        serializer = GroupSerializer(roles, many=True)
        return Response(serializer.data)

    @list_route()
    def get_mfatype(self, request):
        return Response(CurationUser.MfaType.values)

    def _delete_auth_token_(self, userId):
        """
        Destroy the authentication token for this user
        """
        try:
            tokenInstance = Token.objects.get(user_id=userId)
            tokenInstance.delete()
            return
        except Token.DoesNotExist:
            return

    @list_route()
    def logout(self, request):
        """
        Destroy the authentication token for this user
        """
        user = request.user
        self._delete_auth_token_(user.id)
        return Response(status=status.HTTP_200_OK)

    @list_route()
    def reset_password(self, request):
        email = request.GET['email']
        try:
            user = CurationUser.objects.get(email=email)
            user.reset_password_requested_by = request.user
            user.otp_secret_key = pyotp.random_base32()
            user.save()
        except CurationUser.DoesNotExist:
            return Response({"message": "user details not found with this email"}, status=status.HTTP_404_NOT_FOUND)

        SendEmailUtil().generate_reset_password_link(
            user, 'resetEmailTemplate.html', settings.RESET_PASSWORD_MAIL_SUBJECT)

        return Response({"message": "forgot password email sent"}, status=status.HTTP_200_OK)

    @list_route()
    def get_current_user_details(self, request):
        user = self.get_serializer(request.user)
        return Response(user.data, status=status.HTTP_200_OK)
