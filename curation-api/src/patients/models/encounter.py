import logging

from django.conf import settings
from django.db import models
from django.shortcuts import get_object_or_404

from ...common import enums
from ...utilities.base_model import BaseModel

from ..models.cohort import Cohort
from ..models.patient import Patient

# Get an instance of a logger
logger = logging.getLogger(__name__)


class EncounterManager(models.Manager):
    def get_encounter(self, cohort_id, patient_id, encounter_id):
        return get_object_or_404(Encounter,
                                 cohort_id=cohort_id,
                                 patient_id=patient_id,
                                 id=encounter_id)

class Encounter(BaseModel):
    class Meta:
        # https://docs.djangoproject.com/en/1.10/ref/models/options/#db-table
        db_table = 'curation_encounter'
        unique_together = (('patient', 'cohort', 'encounter_id'))

    id = models.AutoField(primary_key=True)
    patient = models.ForeignKey(
        Patient, on_delete=models.CASCADE, related_name='encounters',)
    cohort = models.ForeignKey(
        Cohort, on_delete=models.CASCADE, related_name='cohort_encounters',)
    encounter_id = models.CharField(
        max_length=settings.STRING_MAX_DEFAULT_LENGTH, db_index=True, null=True,)
    data_source_id = models.IntegerField(null=False)
    provider_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=False)
    start = models.CharField(
        max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=False)
    end = models.CharField(
        max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    admitting_provider_id = models.CharField(
        max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    rendering_provider_id = models.CharField(
        max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    facility_id = models.CharField(
        max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    type = models.CharField(
        max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    discharge_disposition = models.CharField(
        max_length=settings.STRING_MAX_DEFAULT_LENGTH,
        null=True,
        choices=enums.Patient_discharge_status_codes.choices)
    place_of_service = models.CharField(
        max_length=settings.STRING_MAX_DEFAULT_LENGTH,
        null=True)
    type_of_bill = models.CharField(
        max_length=settings.STRING_MAX_DEFAULT_LENGTH,
        null=True,
        choices=enums.Claim_submission_bill_types.choices)

    objects = EncounterManager()

    def getPatientEncounters(self, patient_id, cohort_id):
        query = '''SELECT * FROM {} WHERE patient_id = '{}' and cohort_id= '{}' '''.format(
            'curation_encounter', patient_id, cohort_id)
        logger.info('query: %s', query)
        return Encounter.objects.raw(query)
