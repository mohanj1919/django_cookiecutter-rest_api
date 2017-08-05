from django.db import models
from django.conf import settings
import logging

# Get an instance of a logger
logger = logging.getLogger(__name__)

from ...utilities.base_model import BaseModel

class Observation(BaseModel):
    class Meta:
	    # https://docs.djangoproject.com/en/1.10/ref/models/options/#db-table
	    db_table = 'curation_observation'

    id = models.AutoField(primary_key=True)
    encounter_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, db_index=True, null=True,)
    documenting_prov_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    name = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    code = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    value = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    unit = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    status = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)

    def getObservationForEncounter(self, encounterid):
        query = '''SELECT * FROM {} WHERE encounter_id = '{}' '''.format('curation_observation', encounterid)
        logger.info('query: {}'.format(query))
        return Observation.objects.raw(query)
