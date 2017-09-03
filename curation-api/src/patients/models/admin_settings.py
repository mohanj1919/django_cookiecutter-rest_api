from django.db import models
from django.conf import settings
from djchoices import DjangoChoices, ChoiceItem

from ...utilities.base_model import BaseModel

class AdminSettingManager(models.Manager):
    def get_setting_value(self, setting, default_value):
        try:
            instance = self.get(setting=setting, is_active=True)
            return instance.value
        except AdminSetting.DoesNotExist:
            return default_value

class AdminSetting(BaseModel):
    class Meta:
        # https://docs.djangoproject.com/en/1.10/ref/models/options/#db-table
        db_table = 'curation_admin_setting'

    class Settings_type(DjangoChoices):
        text = ChoiceItem("text")
        number = ChoiceItem("number")

    class ConfigurableSettings(DjangoChoices):
        password_expiry = ChoiceItem('password_expiry')
        password_history_check = ChoiceItem('password_history_check')
        otp_message = ChoiceItem('otp_message')

    id = models.AutoField(primary_key=True)
    setting = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, unique=True)
    text = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True, blank=True)
    type = models.CharField(max_length=20, null=False, blank=False, choices=Settings_type.choices, default=Settings_type.text)
    # for text type min/max refers to legth of the value
    # for number type min/max referes to the limits of the value
    min = models.IntegerField(null=True, default=0)
    max = models.IntegerField(null=True)
    value = models.TextField(null=False, blank=False)
    settings_group = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True, blank=True, default='')

    objects = AdminSettingManager()
