from django.contrib.auth.models import Group
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.conf import settings

from ..models import CurationUser


class IsCuratorExists(object):
    def __call__(self, user_ids):
        curators = CurationUser.objects.get_user_details(user_ids)
        count = curators.count()
        if count < len(user_ids):
            raise serializers.ValidationError('User detials not found.')


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ('id', 'name')


class UserRetrieveSerializer(serializers.ModelSerializer):
    class Meta:
        model = CurationUser
        fields = ('id', 'email', 'mfa_type', 'phone_number', 'is_active')


class UserSerializer(serializers.ModelSerializer):
    groups = GroupSerializer(many=True)

    class Meta:
        model = CurationUser
        fields = ('id', 'email', 'first_name', 'last_name', 'mfa_type',
                  'password_expiry_on', 'phone_number', 'is_active', 'groups')


class CreateUserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(validators=[
        UniqueValidator(
            queryset=CurationUser.objects.all(),
            message="Email Id already exists.",
            lookup='iexact'
        )]
    )

    mfa_type = serializers.ChoiceField(CurationUser.MfaType.choices, required=False)
    phone_number = serializers.CharField(max_length=15, required=False)

    class Meta:
        model = CurationUser
        fields = ('id', 'email', 'first_name', 'last_name', 'phone_number', 'mfa_type', 'groups')

    def create(self, validated_data):
        #  email, password, first_name, last_name
        data = validated_data
        email = data.pop('email')
        password = settings.DEFAULT_PASSWORD
        first_name = data.pop('first_name')
        last_name = data.pop('last_name')
        data.pop('groups')
        # phone_number = data.pop('phone_number', None)
        return CurationUser.objects.create_user(email, password, first_name, last_name, **data)


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for password change endpoint.
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_new_password = serializers.CharField(required=True)


class UpdateProfileSerializer(serializers.ModelSerializer):
    change_password = ChangePasswordSerializer(required=False)

    class Meta:
        model = CurationUser
        fields = ('id', 'first_name', 'last_name', 'profile_picture', 'change_password')

    def update(self, instance, validated_data):
        """
        Update the profile information
        """
        password = validated_data.get('change_password', None)
        instance.first_name = validated_data['first_name']
        instance.last_name = validated_data['last_name']
        instance.profile_picture = validated_data.get('profile_picture', instance.profile_picture)
        instance.save()
        if password is not None:
            new_password = password.get('new_password')
            instance.update_password(new_password)
        return instance


class UserDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = CurationUser
        fields = ('email', 'first_name', 'last_name', 'phone_number')
