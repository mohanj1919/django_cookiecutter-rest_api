from django.db import models
from django.conf import settings

from .cohort import Cohort
from .crf_template import CRFTemplate
from ...utilities.base_model import BaseModel


class CRFQuestion(BaseModel):
    class Meta:
        # https://docs.djangoproject.com/en/1.10/ref/models/options/#db-table
        db_table = 'curation_crf_question'

    id = models.AutoField(primary_key=True)
    text = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, db_index=True, unique=True)
    description = models.TextField(null=True, blank=True)
    type = models.TextField(null=False)
    responses = models.TextField(null=True, blank=True)
    note = models.TextField(null=True, blank=True)
