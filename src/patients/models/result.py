from django.db import models
from django.conf import settings
import logging

# Get an instance of a logger
logger = logging.getLogger(__name__)

from ...utilities.base_model import BaseModel

class Result(BaseModel):
    class Meta:
		# https://docs.djangoproject.com/en/1.10/ref/models/options/#db-table
        db_table = 'curation_result'

    id = models.AutoField(primary_key=True)
    encounter_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, db_index=True, null=True,)
    status = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    order_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    order_code = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    panel_code = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    panel_name = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    code = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    name = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    value = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    unit = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    reference_range = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    loinc = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    performed_dttm = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    performing_provider_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    documenting_provider_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    microbio_organism = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    microbio_antibiotic = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    microbio_sensitivity = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    microbio_mic = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    abnormal_flag = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    specimen_source = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    reference_range_lower = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    reference_range_upper = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)

    def getResultForEncounter(self, encounterid):
        query = '''SELECT * FROM {} WHERE encounter_id = '{}' '''.format('curation_result', encounterid)
        logger.info('query: {}'.format(query))
        return Result.objects.raw(query)
