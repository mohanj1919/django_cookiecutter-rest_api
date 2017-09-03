from rest_framework import serializers
from django.conf import settings

from ..models import AdminSetting

class AdminSettingSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    setting = serializers.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, required=True)
    text = serializers.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, allow_null=True, allow_blank=True)
    type = serializers.ChoiceField(choices=AdminSetting.Settings_type.choices)
    value = serializers.CharField(required=True, allow_null=False, allow_blank=False)
    min = serializers.IntegerField(required=False)
    max = serializers.IntegerField(required=False)
    settings_group = serializers.CharField(
        max_length=settings.STRING_MAX_DEFAULT_LENGTH, allow_null=True, allow_blank=True)

    class Meta:
        fields = ('id', 'setting', 'text', 'type', 'value', 'min', 'max', 'settings_group')
        read_only_fields = ('type', 'settings_group', 'min', 'max')


    def validate_setting_value(self, min, max, setting, text, setting_type, value):
        """
        Validates setting value
        """
        response = {"errors": {}}
        if setting_type == AdminSetting.Settings_type.number:
            try:
                value = int(value)
                if not min <= value <= max:
                    message = 'value must be between {min} and {max}'
                    message = message.format(min=min, max=max)
                    response["errors"][setting] = [message]
                    raise serializers.ValidationError(response)
            except ValueError:
                message = 'please provide valid value'
                response["errors"][setting] = [message]
                raise serializers.ValidationError(response)
        if setting_type == AdminSetting.Settings_type.text:
            size = len(value)
            if not min <= size <= max:
                message = 'value must be less than {max} characters'
                message = message.format(max=max)
                response["errors"][setting] = [message]
                raise serializers.ValidationError(response)

    def create(self, validated_data):
        """
        Create/updates admin setting values.
        """
        try:
            setting = validated_data.get('setting')
            setting_id = validated_data.get('id', None)
            value = validated_data.get('value')
            admin_setting = AdminSetting.objects.get(setting=setting, is_active=True, id=setting_id)
            self.validate_setting_value(admin_setting.min, admin_setting.max, setting, admin_setting.text, admin_setting.type, value)
            admin_setting.value = validated_data.get('value')
            admin_setting.save()
            return admin_setting
        except AdminSetting.DoesNotExist:
            admin_setting = AdminSetting.objects.create(**validated_data)
            admin_setting.save()
            return admin_setting
