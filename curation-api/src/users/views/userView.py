
from datetime import datetime

import logging
import pyotp
from django.db import transaction
from django.contrib.auth.models import Group
from django.db.models import Q
from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework import mixins, permissions, status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import detail_route, list_route
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from ...patients.models import EmailTemplate, ProjectCohortPatient, PatientChartReview
from ..models import CurationUser, PasswordHistory
from ...utilities import (
    ListModelViewMixin,
    IsOwner,
    GenericViewSet)
from ..serializers.userSerializer import (
    CreateUserSerializer,
    GroupSerializer,
    UpdateProfileSerializer,
    UserSerializer,
    UserRetrieveSerializer
)
from ..utils import SendEmailUtil

# Get an instance of a logger
logger = logging.getLogger(__name__)


class UserViewSet(mixins.RetrieveModelMixin,
                  ListModelViewMixin,
                  GenericViewSet):
    """
    A viewset that provides the Get, Update and Delete actions on User model
    """

    queryset = CurationUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)
    model = CurationUser
    curator_allowed_actions = ['update_profile',
                               'get_current_user_details', 'logout']

    def get_serializer_class(self):
        if self.action in ['create', 'update']:
            return CreateUserSerializer
        return UserSerializer

    def _get_object(self, pk):
        try:
            return CurationUser.objects.get(pk=pk)
        except CurationUser.DoesNotExist:
            raise Http404

    def get_queryset(self):
        queryset = self.queryset.exclude(email=self.request.user.email)
        queryset = queryset.filter(is_deleted=False)
        return queryset

    def filter_query_set(self, search_param):
        query = Q(email__icontains=search_param) | Q(
            first_name__icontains=search_param) | Q(
                last_name__icontains=search_param) | Q(
                    groups__name__icontains=search_param) | Q(
                        phone_number__icontains=search_param) | Q(
                            mfa_type__icontains=search_param)
        queryset = self.get_queryset()
        return queryset.filter(query)

    @transaction.atomic
    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        createdUser = self._perform_create(serializer)
        userData = UserSerializer(createdUser).data

        logger.info('sending email confirmation link')

        SendEmailUtil().generate_reset_password_link(
            createdUser, EmailTemplate.Templates.welcome_email)

        logger.info('email confirmation link sent')
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

    @transaction.atomic
    def update(self, request, pk=None):
        instance = self._get_object(pk)
        serializer = self.get_serializer(instance, data=request.data)
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.save()
        userData = UserSerializer(user).data
        return Response(userData, status=status.HTTP_200_OK)

    @transaction.atomic
    @detail_route(methods=['post'])
    def update_profile(self, request, pk=None):
        user = self._get_object(pk)
        data = request.data
        serializer = UpdateProfileSerializer(user, data=data)
        password = data.get('change_password', None)

        if password is not None:
            if not request.user.check_password(password.get('old_password')):
                raise ValidationError({'errors': {
                    "old_password": ["Invalid Password."]
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
        """
        gets the available MFA types
        """
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

    @transaction.atomic
    @list_route()
    def logout(self, request):
        """
        Destroy the authentication token for this user
        """
        user = request.user
        self._delete_auth_token_(user.id)
        return Response(status=status.HTTP_200_OK)

    @transaction.atomic
    @list_route()
    def reset_password(self, request):
        """
        Resets the user password
        """
        email = request.GET['email']
        try:
            user = CurationUser.objects.get(email=email)
            user.reset_password_requested_by = request.user
            user.otp_secret_key = pyotp.random_base32()
            user.save()
            SendEmailUtil().generate_reset_password_link(
                user, EmailTemplate.Templates.reset_password_email)
            return Response({"message": "forgot password email sent"}, status=status.HTTP_200_OK)
        except CurationUser.DoesNotExist:
            return Response({"message": "user details not found with this email"}, status=status.HTTP_404_NOT_FOUND)

    @list_route(permission_classes=[IsOwner])
    def get_current_user_details(self, request):
        """
        Get the current logged in user details
        """
        user = self.get_serializer(request.user)
        return Response(user.data, status=status.HTTP_200_OK)

    @list_route()
    def get_curators(self, request):
        """
        Gets all the curator details
        """
        req_param = request.GET
        search_param = req_param.get('searchParam', None)
        queryset = CurationUser.objects.filter(
            is_deleted=False, is_active=True, groups__name='curator')

        if search_param is not None:
            queryset = queryset.filter(email__icontains=search_param)

        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = UserRetrieveSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = UserRetrieveSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @transaction.atomic
    def destroy(self, request, pk=None):
        print('$&^(*&(@*$&%(*&$%(*@$&%(*&$(*A&%*(')
        instance = self.get_object()
        loggedInUser = request.user
        if instance.id == loggedInUser.id:
            return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
        self._validate_delete_user(instance)
        self.delete_user(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def _validate_delete_user(self, instance):
        patient_chart_reviews = PatientChartReview.objects.filter(
            status__in=[
                PatientChartReview.StatusType.inprogress,
                PatientChartReview.StatusType.completed],
            curator_id=instance.id).distinct('curator_id')
        if patient_chart_reviews:
            message = "User '{}' is involved in patient curation.".format(
                instance.email)
            res = {'errors': {}}
            res['errors']['users'] = [message]
            raise ValidationError(res)

    def unassign_chart_reviews(self, user):
        """
        Un-assign the pending/inprogress chart reviews of this curator
        """
        related_project_cohort_patients = ProjectCohortPatient.objects.filter(
            curator=user.id,
            is_active=True
        ).exclude(
            curation_status=ProjectCohortPatient.CurationStatus.completed
        )
        curator_chart_reviews = PatientChartReview.objects.filter(
            curator=user.id,
            is_active=True
        ).exclude(
            status=PatientChartReview.StatusType.completed
        )
        related_project_cohort_patients.update(curator_id=None)
        curator_chart_reviews.update(is_active=False)
        return

    def delete_user(self, user):
        user.is_deleted = True
        user.deleted_on = datetime.now().isoformat()
        user.deleted_by = user.email
        user.save()
        user.last_passwords.filter(is_active=True).delete()
        user.related_projects.filter(is_active=True).update(is_active=False)
        self.unassign_chart_reviews(user)
        # delete api auth token associated with the user
        self._delete_auth_token_(user.id)

    @transaction.atomic
    @detail_route(methods=['delete'])
    def confirm_delete(self, request, pk=None):
        instance = self.get_object()
        loggedInUser = request.user
        if instance.id == loggedInUser.id:
            return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
        self.delete_user(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @list_route(methods=['post'])
    def activate_user(self, request):
        """
        Activate curation user
        """
        data = request.data
        email = data.get('email', None)
        user_id = data.get('user_id', None)
        res = {'errors': {}}
        message = 'This value should be provided'
        if email is None:
            res['errors']['email'] = [message]
            return Response(res, status=status.HTTP_400_BAD_REQUEST)
        if user_id is None:
            res['errors']['email'] = [message]
            return Response(res, status=status.HTTP_400_BAD_REQUEST)
        user = get_object_or_404(
            CurationUser, email=email, id=user_id, is_active=False)
        user.is_active = True
        user.save()
        return Response(status=status.HTTP_200_OK)
