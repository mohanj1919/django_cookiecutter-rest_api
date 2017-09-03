import logging

from django.conf import settings
from django.db import models

from ...utilities.base_model import BaseModel
from .encounter import Encounter

# Get an instance of a logger
logger = logging.getLogger(__name__)


class Result(BaseModel):
    class Meta:
		# https://docs.djangoproject.com/en/1.10/ref/models/options/#db-table
        db_table = 'curation_result'

    id = models.AutoField(primary_key=True)
    encounter_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, db_index=True, null=True,)
    status = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    panel_code = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    panel_name = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    code = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    name = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    value = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    unit = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    reference_range = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    loinc = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    performed = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    abnormal = models.NullBooleanField(null=True)
    specimen_source = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)

    patient_encounter = models.ForeignKey(Encounter, on_delete=models.CASCADE, related_name='results', null=True)

    def getResultForEncounter(self, encounterid):
        query = '''SELECT * FROM {} WHERE encounter_id = '{}' '''.format('curation_result', encounterid)
        logger.info('query: %s', query)
        return Result.objects.raw(query)
