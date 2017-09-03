from rest_framework import serializers

class LoginSerializer(serializers.Serializer):
    """
    Serializer for logging in user
    """
    email = serializers.CharField(required=True)
    password = serializers.CharField(required=True)

class MfaSerializer(serializers.Serializer):
    """
    MFA token request serializer
    """
    email = serializers.CharField(required=True)
    password = serializers.CharField(required=True)
    token = serializers.CharField(required=True)

class ResetPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(required=True)
    uuid = serializers.CharField(required=True)
