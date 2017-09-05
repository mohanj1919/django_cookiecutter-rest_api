from django.conf import settings
from django.contrib.auth.models import Group

from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from ...patients.models import AdminSetting, PatientChartReview
from ..models import CurationUser, PasswordHistory


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
        fields = ('id', 'email', 'mfa_type', 'phone_number', 'is_active', 'is_account_locked')


class UserSerializer(serializers.ModelSerializer):
    groups = GroupSerializer(many=True)
    curator_chart_reviews = serializers.SerializerMethodField()

    def get_curator_chart_reviews(self, instance):
        chart_reviews = PatientChartReview.objects.filter(
            curator_id = instance.id,
            is_active=True,
            status__in=[
                PatientChartReview.StatusType.completed,
                PatientChartReview.StatusType.inprogress]).count()
        return chart_reviews

    class Meta:
        model = CurationUser
        fields = ('id', 'email', 'first_name', 'last_name', 'mfa_type',
                  'password_expiry_on', 'phone_number', 'is_active', 'groups',
                  'curator_chart_reviews', 'is_account_locked')


class CreateUserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(validators=[
        UniqueValidator(
            queryset=CurationUser.objects.all(),
            message="Email Id already exists.",
            lookup='iexact')
    ])

    mfa_type = serializers.ChoiceField(
        CurationUser.MfaType.choices, required=False)
    phone_number = serializers.CharField(max_length=15, required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = CurationUser
        fields = ('id', 'email', 'first_name', 'last_name',
                  'phone_number', 'mfa_type', 'groups', 'is_active', 'is_account_locked')

    def create(self, validated_data):
        #  email, password, first_name, last_name
        data = validated_data
        email = data.pop('email')
        password = settings.DEFAULT_PASSWORD
        first_name = data.pop('first_name')
        last_name = data.pop('last_name')
        data.pop('groups')
        data.pop('is_active', None)
        # phone_number = data.pop('phone_number', None)
        return CurationUser.objects.create_user(email, password, first_name, last_name, **data)

    def update(self, instance, validated_data):
        #  email, password, first_name, last_name
        data = validated_data
        instance.first_name = validated_data.get('first_name')
        instance.last_name = validated_data.get('last_name')
        instance.groups.set(validated_data.get('groups'))
        instance.mfa_type = validated_data.get('mfa_type')
        instance.phone_number = validated_data.get('phone_number')
        instance.is_active = validated_data.get('is_active')
        instance.is_account_locked = validated_data.get('is_account_locked')
        instance.phone_number = validated_data.get('phone_number')
        instance.save()
        return instance


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
        fields = ('id', 'first_name', 'last_name',
                  'profile_picture', 'change_password')

    def update(self, instance, validated_data):
        """
        Update the profile information
        """
        password = validated_data.get('change_password', None)
        instance.first_name = validated_data['first_name']
        instance.last_name = validated_data['last_name']
        instance.profile_picture = validated_data.get(
            'profile_picture', instance.profile_picture)
        pwd_expiry_cycle_days = get_password_expiry_cycle_days()
        instance.save()
        if password is not None:
            new_password = password.get('new_password')
            if can_update_user_password(instance, new_password):
                instance.update_password(new_password, pwd_expiry_cycle_days)
            else:
                error_response = {'errors': {}}
                error_response['errors']['new_password'] = ["Password already used before."]
                raise serializers.ValidationError(error_response)

        return instance


class UserDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = CurationUser
        fields = ('email', 'first_name', 'last_name', 'phone_number')


def isUserHasRole(user, role):
    user_group = user.groups.first()
    return user_group.name == role


def get_password_expiry_cycle_days():
    # get pwd_expiry_cycle_days value from admin_settings table
    pwd_expiry_cycle_days = AdminSetting.objects.get_setting_value(
        AdminSetting.ConfigurableSettings.password_expiry, settings.PWD_EXPIRY_CYCLE_DAYS)
    try:
        pwd_expiry_cycle_days = int(pwd_expiry_cycle_days)
        return pwd_expiry_cycle_days
    except ValueError:
        return settings.PWD_EXPIRY_CYCLE_DAYS


def get_password_history_check_value():
    # get pwd_expiry_cycle_days value from admin_settings table
    pwd_history_check = AdminSetting.objects.get_setting_value(
        AdminSetting.ConfigurableSettings.password_history_check,
        settings.PWD_HISTORY_CHECK_VALUE)
    try:
        pwd_history_check = int(pwd_history_check)
        return pwd_history_check
    except ValueError:
        return settings.PWD_HISTORY_CHECK_VALUE


def can_update_user_password(user, new_password):
    password_histpry_check = get_password_history_check_value()
    last_passowrds = PasswordHistory.objects.filter(user_id=user.id).order_by('-id')[:password_histpry_check]
    can_update_password = True
    for last_password in last_passowrds:
        if last_password.check_password(new_password):
            can_update_password = False
            break
    return can_update_password
