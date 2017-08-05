from rest_framework import serializers
from django.conf import settings

from ..models import AdminSetting

class AdminSettingSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    setting = serializers.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, required=True)
    text = serializers.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, allow_null=True, allow_blank=True)
    type = serializers.CharField(max_length=20, required=True, allow_null=False, allow_blank=False)
    value = serializers.CharField(required=True, allow_null=False, allow_blank=False)
    settings_group = serializers.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, allow_null=True, allow_blank=True)

    class Meta:
        fields = ('id', 'setting', 'text', 'type', 'value', 'settings_group')

    def create(self, validated_data):
        """
        Create/updates admin setting values.
        """
        admin_setting = None
        try:
            setting = validated_data.get('setting')
            id = validated_data.get('id')
            admin_setting = AdminSetting.objects.get(setting=setting, is_active=True, id=id)
            admin_setting.value = validated_data.get('value')
            admin_setting.save()
        except AdminSetting.DoesNotExist:
            admin_setting = AdminSetting.objects.create(**validated_data)
            admin_setting.save()
        return admin_setting
