import json
import uuid
from datetime import datetime, timedelta, timezone

from django.conf import settings
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import Group
from rest_framework import permissions, status, viewsets
from rest_framework.authentication import get_authorization_header
from rest_framework.authtoken.models import Token
from rest_framework.decorators import detail_route, list_route
from rest_framework.response import Response
from rest_framework.request import Request
from ..auth_backend import EmailBackend
from ..models import CurationUser
from ..serializers import (LoginSerializer, MfaSerializer,
                           ResetPasswordSerializer, UserSerializer)
from ..utils import get_totp_instance, SendEmailUtil
import pyotp
import boto3

# Create an SNS client
client = boto3.client(
    "sns",
    aws_access_key_id=settings.DJANGO_AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.DJANGO_AWS_SECRET_ACCESS_KEY,
    region_name=settings.DJANGO_AWS_REGION
)


class AuthViewSet(viewsets.GenericViewSet):
    """
    Enpoints for managing User Authentication
    """
    authentication_classes = []
    permission_classes = (permissions.AllowAny,)

    def get_serializer_class(self):
        if self.action == 'reset_password':
            return ResetPasswordSerializer
        return LoginSerializer

    def _create_auth_token(self, user=None):
        """
        Creates api Token for the authenticated user
        """
        token, created = Token.objects.get_or_create(user=user)
        return token

    def _destroy_auth_token(self, user=None):
        """
        Destroys api Token for the current user
        """
        Token.objects.get(user)
        return token

    def _get_mfa_uri(self, email, secret):
        """
        Returns the MFA URI compatible with Google Authenticator
        """
        totpInstance = get_totp_instance(secret)
        provider = settings.PROVIDER_NAME
        provisioning_uri = totpInstance.provisioning_uri(
            name=email, issuer_name=provider)
        return provisioning_uri

    def _authenticate_and_get_user(self, email, password):
        """
        Authenticates and returns the user if valid
        """
        # Authenticate the user
        emailBackend = EmailBackend()
        user = emailBackend.authenticate(username=email, password=password)
        return user

    def is_password_expired(self, user):
        if datetime.now(timezone.utc) > user.password_expiry_on:
            return True
        else:
            return False

    def send_otp_message(self, otp_secret_key, phone_number):
        totp_instance = get_totp_instance(otp_secret_key, interval=60)
        msg = 'OTP is {otp} for login at OM1. Do not share OTP for security reasons.'
        client.publish(PhoneNumber=phone_number,
                       Message=msg.format(otp=totp_instance.now()))

    @list_route(methods=['post'])
    def login(self, request):
        """
        Validate user credentials
        """
        credentials = request.data

        serializer = LoginSerializer(data=credentials)
        serializer.is_valid(raise_exception=True)

        user = self._authenticate_and_get_user(
            credentials['email'], credentials['password'])

        if user is None:
            return Response({"message": "Please provide valid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

        if self.is_password_expired(user):
            res = {
                "message": "Password expired. Please reset your password.",
                "password_expired": True
            }
            return Response(res, status=status.HTTP_401_UNAUTHORIZED)
        userSerializer = UserSerializer(user)

        resData = {
            "message": "Successfully authenticated",
            "password_expiry_on": user.password_expiry_on,
            "mfa_type": user.mfa_type
        }
        phone_number_last_4_digits = None

        if user.mfa_type == CurationUser.MfaType.sms and user.phone_number is not None:
            phone_number_last_4_digits = '{message:{fill}{align}{width}}'.format(
                message=user.phone_number[-4:], fill='*', align='>', width=len(user.phone_number))
            resData['phone_number'] = phone_number_last_4_digits
            otp_secret_key = user.otp_secret_key
            self.send_otp_message(otp_secret_key, user.phone_number)

        return Response(resData, status=status.HTTP_200_OK)

    @list_route(methods=['post'])
    def verify_mfa_token(self, request):
        """
        Verifies the MFA token
        returns the user detials and api_token if valid
        """
        credentials = request.data
        serializer = MfaSerializer(data=credentials)
        serializer.is_valid(raise_exception=True)
        user = self._authenticate_and_get_user(
            credentials['email'], credentials['password'])

        if user is None:
            return Response({"message": "Please provide valid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

        # otp_secret_key = user.otp_secret_key

        # if user.mfa_type == CurationUser.MfaType.sms:
        #     totp_instance = get_totp_instance(otp_secret_key, interval=60)
        # elif user.mfa_type == CurationUser.MfaType.google:
        #     totp_instance = get_totp_instance(otp_secret_key)
        # else:
        #     totp_instance = None

        # if totp_instance is not None and not totp_instance.verify(credentials['token']):
        #     return Response({
        #         "error": "Invalid token provided"
        #     })

        userSerializer = UserSerializer(user)
        token = self._create_auth_token(user)
        response = {
            "user": userSerializer.data,
            "api_token": str(token)
        }
        return Response(response, status=status.HTTP_200_OK)

    @list_route(methods=['post'])
    def reset_password(self, request):
        """
        Reset the password for the user
        """
        password = request.data['password']
        forgot_password_hash = request.data['uuid']
        url_expired_response = Response(
            {"message": 'Password reset url expired'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = CurationUser.objects.get(forgot_password_hash=forgot_password_hash)

            if user is None:
                return url_expired_response
            if user.forgot_password_hash_expiry_on.isoformat() < datetime.now().isoformat():
                return url_expired_response

            user.forgot_password_hash = None
            user.forgot_password_hash_expiry_on = None

            successs_response = {
                "message": "password set successfully"
            }

            mfaUrl = self._get_mfa_uri(user.email, user.otp_secret_key)

            if not user.is_active and user.mfa_type == CurationUser.MfaType.google:
                successs_response["mfaUrl"] = mfaUrl

            # if password reset is requrested by admin then reset the otp secret key and return mfa_url
            if user.reset_password_requested_by is not None:
                reset_password_requested_by = UserSerializer(user.reset_password_requested_by).data
                reset_password_requested_by_user_group = reset_password_requested_by.get('groups')[0]
                admin_group = Group.objects.get(name='admin')

                if admin_group is not None \
                        and admin_group.name == reset_password_requested_by_user_group.get('name') \
                        and user.mfa_type == CurationUser.MfaType.google:
                    successs_response["mfaUrl"] = mfaUrl

            user.is_active = True
            user.reset_password_requested_by = None
            user.update_password(password)
            user.save()
            return Response(successs_response, status=status.HTTP_200_OK)
        except CurationUser.DoesNotExist:
            return url_expired_response
        except:
            return Response({"message": "Unable to reset password"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @list_route()
    def forgot_password(self, request):
        mail_id = request.GET['email']
        try:
            user = CurationUser.objects.get(email=mail_id)
        except CurationUser.DoesNotExist:
            return Response({"message": "user details not found with this email"}, status=status.HTTP_404_NOT_FOUND)

        SendEmailUtil().generate_reset_password_link(
            user, 'resetEmailTemplate.html', settings.RESET_PASSWORD_MAIL_SUBJECT)

        return Response({"message": "forgot password email sent"}, status=status.HTTP_200_OK)
