from django.db import models
from django.conf import settings
from djchoices import DjangoChoices, ChoiceItem

from ...utilities.base_model import BaseModel

class AdminSetting(BaseModel):
    class Meta:
        # https://docs.djangoproject.com/en/1.10/ref/models/options/#db-table
        db_table = 'curation_admin_setting'

    id = models.AutoField(primary_key=True)
    setting = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, unique=True)
    text = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True, blank=True)
    type = models.CharField(max_length=20, null=False, blank=False)
    value = models.TextField(null=False, blank=False)
    settings_group = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True, blank=True, default='')
