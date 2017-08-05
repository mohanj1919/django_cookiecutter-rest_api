from django.db import models
from django.conf import settings
from django.utils import timezone

from .cohort import Cohort
from ...utilities.base_model import BaseModel

class CRFTemplateManager(models.Manager):
    def get_crf_template_details(self, crf_template_id):
        crf_templates = self.filter(id=crf_template_id, is_active=True)
        return crf_templates

    def get_all_crf_template_details(self, crf_template_ids):
        crf_templates = self.filter(id__in=crf_template_ids, is_active=True)
        return crf_templates

class CRFTemplate(BaseModel):
    class Meta:
        # https://docs.djangoproject.com/en/1.10/ref/models/options/#db-table
        db_table = 'curation_crf_template'

    objects = CRFTemplateManager()

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, db_index=True, unique=True)
    description = models.TextField(null=True,)
