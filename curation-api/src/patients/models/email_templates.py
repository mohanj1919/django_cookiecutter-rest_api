from django.db import models
from django.conf import settings
from djchoices import DjangoChoices, ChoiceItem

from ...utilities.base_model import BaseModel

class EmailTemplateManager(models.Manager):
    def get_template_by_name(self, name):
        try:
            instance = self.get(name=name, is_active=True)
            return instance
        except EmailTemplate.DoesNotExist as er:
            raise er


class EmailTemplate(BaseModel):
    class Meta:
        # https://docs.djangoproject.com/en/1.10/ref/models/options/#db-table
        db_table = 'curation_email_template'
        unique_together = (('name', 'is_active'))
    
    class Templates(DjangoChoices):
        welcome_email = ChoiceItem('welcome_email')
        reset_password_email = ChoiceItem('reset_password_email')

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, unique=True)
    display_name = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True, blank=True)
    subject = models.CharField(max_length=1000, null=False, blank=False,)
    template = models.TextField(null=False, blank=False)
    place_holders = models.TextField(null=True, blank=True)

    objects=EmailTemplateManager()
