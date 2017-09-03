import logging

from django.conf import settings
from django.db import models

from ...utilities.base_model import BaseModel
from .encounter import Encounter
from ...common import enums

# Get an instance of a logger
logger = logging.getLogger(__name__)


class Diagnosis(BaseModel):
    class Meta:
        # https://docs.djangoproject.com/en/1.10/ref/models/options/#db-table
        db_table = 'curation_diagnosis'

    id = models.AutoField(primary_key=True)
    code = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, db_index=True, null=False)
    encounter_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, db_index=True, null=True,)
    patient_encounter = models.ForeignKey(Encounter, on_delete=models.CASCADE, related_name='diagnoses', null=True)
    code_type = models.CharField(
        max_length=settings.STRING_MAX_DEFAULT_LENGTH,
        null=False,
        choices=enums.Diagnosis_code_type.choices)
    category = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)

    name = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    status = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH,
                              null=True,
                              choices=enums.Diagnosis_status.choices,
                              default=None)
    onset = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    resolution = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    principal_dx = models.NullBooleanField(null=True,)

    def getDiagnosisForEncounter(self, encounterid):
        query = '''SELECT * FROM {} WHERE encounter_id = '{}' '''.format(
            'curation_diagnosis', encounterid)
        logger.info('query: %s', query)
        return Diagnosis.objects.raw(query)
