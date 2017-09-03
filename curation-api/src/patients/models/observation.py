import logging

from django.conf import settings
from django.db import models

from ...utilities.base_model import BaseModel
from .encounter import Encounter

# Get an instance of a logger
logger = logging.getLogger(__name__)


class Observation(BaseModel):
    class Meta:
	    # https://docs.djangoproject.com/en/1.10/ref/models/options/#db-table
        db_table = 'curation_observation'

    id = models.AutoField(primary_key=True)
    code = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    name = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    units = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    value = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    encounter_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, db_index=True, null=True,)

    patient_encounter = models.ForeignKey(Encounter, on_delete=models.CASCADE, related_name='observations', null=True)

    def getObservationForEncounter(self, encounterid):
        query = '''SELECT * FROM {} WHERE encounter_id = '{}' '''.format('curation_observation', encounterid)
        logger.info('query: %s', query)
        return Observation.objects.raw(query)
