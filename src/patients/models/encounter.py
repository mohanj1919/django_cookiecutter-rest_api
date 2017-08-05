from django.db import models
from django.conf import settings
import logging

# Get an instance of a logger
logger = logging.getLogger(__name__)

from ...utilities.base_model import BaseModel

class Encounter(BaseModel):
    class Meta:
        # https://docs.djangoproject.com/en/1.10/ref/models/options/#db-table
        db_table = 'curation_encounter'

    id = models.AutoField(primary_key=True)
    encounter_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, db_index=True, null=True,)
    patient_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, db_index=True, null=True,)
    admission_dttm = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    admitting_physician_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    arrival_dttm = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    attending_physician_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    billing_provider_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    claim_statement_from_dttm = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    claim_statement_to_dttm = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    discharge_disposition = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    discharge_dttm = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    documenting_provider_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    dttm = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    location = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    place_of_service = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    rendering_provider_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    type = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    type_of_bill = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)

    def getPatientEncounters(self, patientId):
        query = '''SELECT * FROM {} WHERE patient_id = '{}' '''.format('curation_encounter', patientId)
        logger.info('query: {}'.format(query))
        return Encounter.objects.raw(query)
