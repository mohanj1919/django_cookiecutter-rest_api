from django.db import models
from django.conf import settings
import logging

# Get an instance of a logger
logger = logging.getLogger(__name__)

from ...utilities.base_model import BaseModel

class Procedure(BaseModel):
    class Meta:
		# https://docs.djangoproject.com/en/1.10/ref/models/options/#db-table
        db_table = 'curation_procedure'

    id = models.AutoField(primary_key=True)
    encounter_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, db_index=True, null=True,)
    anatomic_location = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    billing_provider_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    code = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    code_type = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    documenting_provider_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    ordering_provider_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    performing_provider_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    principal_procedure_flag = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    quantity = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    results = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    rev_code = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    status = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)

    def getProcedureForEncounter(self, encounterid):
        query = '''SELECT * FROM {} WHERE encounter_id = '{}' '''.format('curation_procedure', encounterid)
        logger.info('query: {}'.format(query))
        return Procedure.objects.raw(query)
