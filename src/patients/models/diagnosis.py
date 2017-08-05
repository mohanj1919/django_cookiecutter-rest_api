from django.db import models
from django.conf import settings
import logging

# Get an instance of a logger
logger = logging.getLogger(__name__)

from ...utilities.base_model import BaseModel

class Diagnosis(BaseModel):
    class Meta:
        # https://docs.djangoproject.com/en/1.10/ref/models/options/#db-table
        db_table = 'curation_diagnosis'

    id = models.AutoField(primary_key=True)
    code = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, db_index=True,)
    encounter_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, db_index=True, null=True,)
    code_type = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    category = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    documenting_provider_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    name = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    status = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    pl_flag = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    onset_dttm = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    resolution_dttm = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    principal_dx_flag = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    admitting_dx_flag = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    discharge_dx_flag = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    present_on_admission = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)

    def getDiagnosisForEncounter(self, encounterid):
        query = '''SELECT * FROM {} WHERE encounter_id = '{}' '''.format('curation_diagnosis', encounterid)
        logger.info('query: {}'.format(query))
        return Diagnosis.objects.raw(query)
