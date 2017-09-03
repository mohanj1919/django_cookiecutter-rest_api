import logging

from django.conf import settings
from django.db import models

from .cohort import Cohort
from ...utilities.base_model import BaseModel

# Get an instance of a logger
logger = logging.getLogger(__name__)


class Provider(BaseModel):
    class Meta:
	    # https://docs.djangoproject.com/en/1.10/ref/models/options/#db-table
        db_table = 'curation_provider'

    id = models.AutoField(primary_key=True)
    provider_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=False)
    first_name = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=False)
    last_name = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=False)
    npi = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    specialty_code = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    type = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)

    cohort = models.ForeignKey(Cohort, on_delete=models.CASCADE, null=True, related_name='providers')

    # def getProviderForEncounter(self, encounterid):
    #     query = '''SELECT * FROM {} WHERE encounter_id = '{}' '''.format('curation_provider', encounterid)
    #     logger.info('query: {}'.format(query))
    #     return Provider.objects.raw(query)
