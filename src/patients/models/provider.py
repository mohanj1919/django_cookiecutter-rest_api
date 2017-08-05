from django.db import models
from django.conf import settings
import logging

# Get an instance of a logger
logger = logging.getLogger(__name__)

from ...utilities.base_model import BaseModel

class Provider(BaseModel):
    class Meta:
	    # https://docs.djangoproject.com/en/1.10/ref/models/options/#db-table
        db_table = 'curation_provider'

    id = models.AutoField(primary_key=True)
    encounter_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, db_index=True, null=True,)
    department_local = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    department_mapped = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    npi = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    specialty_code_local = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    specialty_code_mapped = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    specialty_is_primary_flag = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    specialty_sequence_number = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    status_local = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    status_mapped = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    type_local = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    type_mapped = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    zip_code = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)

    def getProviderForEncounter(self, encounterid):
        query = '''SELECT * FROM {} WHERE encounter_id = '{}' '''.format('curation_provider', encounterid)
        logger.info('query: {}'.format(query))
        return Provider.objects.raw(query)
