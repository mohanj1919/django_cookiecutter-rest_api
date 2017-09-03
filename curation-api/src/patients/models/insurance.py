from django.db import models
from django.conf import settings
import logging

# Get an instance of a logger
logger = logging.getLogger(__name__)

from ...utilities.base_model import BaseModel

class Insurance(BaseModel):
    class Meta:
        # https://docs.djangoproject.com/en/1.10/ref/models/options/#db-table
        db_table = 'curation_insurance'

    id = models.AutoField(primary_key=True)
    encounter_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, db_index=True, null=True,)
    benefit_code = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    benefit_name = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    financial_class_code = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    financial_class_name = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    company_code = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    company_name = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    plan_code = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    plan_name = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)

    def getInsuranceForEncounter(self,encounterid):
        query = '''SELECT * FROM {} WHERE encounter_id = '{}' '''.format('curation_insurance', encounterid)
        logger.info('query: {}'.format(query))
        return Insurance.objects.raw(query)
