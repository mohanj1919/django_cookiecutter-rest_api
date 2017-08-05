from django.db import models
from django.conf import settings
import logging

# Get an instance of a logger
logger = logging.getLogger(__name__)

from ...utilities.base_model import BaseModel

class JointExam(BaseModel):
    class Meta:
        # https://docs.djangoproject.com/en/1.10/ref/models/options/#db-table
        db_table = 'curation_joint_exam'

    id = models.AutoField(primary_key=True)
    encounter_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, db_index=True, null=True,)
    performing_provider_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    documenting_provider_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    esr = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    status = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    total_normal_28_joint_count = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    total_swollen_28_joint_count = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    total_tender_28_joint_count = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    total_normal_76_joint_count = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    total_swollen_76_joint_count = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    total_tender_76_joint_count = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)

    def getJointExamForEncounter(self, encounterid):
        query = '''SELECT * FROM {} WHERE encounter_id = '{}' '''.format('curation_joint_exam', encounterid)
        logger.info('query: {}'.format(query))
        return JointExam.objects.raw(query)
