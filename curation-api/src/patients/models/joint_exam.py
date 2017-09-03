import logging

from django.conf import settings
from django.db import models
from django.shortcuts import get_object_or_404

from ...utilities.base_model import BaseModel
from .encounter import Encounter

# Get an instance of a logger
logger = logging.getLogger(__name__)

class JointExamManager(models.Manager):
    def get_joint_exam(self, id):
        return get_object_or_404(JointExam, id=id)


class JointExam(BaseModel):
    class Meta:
        # https://docs.djangoproject.com/en/1.10/ref/models/options/#db-table
        db_table = 'curation_joint_exam'

    id = models.AutoField(primary_key=True)
    encounter_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, db_index=True, null=True,)
    performing_provider_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    esr = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    total_normal_28_joint_count = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    total_swollen_28_joint_count = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    total_tender_28_joint_count = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    total_normal_76_joint_count = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    total_swollen_76_joint_count = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    total_tender_76_joint_count = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)

    patient_encounter = models.ForeignKey(Encounter, on_delete=models.CASCADE, related_name='joint_exams', null=True)

    objects = JointExamManager()

    def getJointExamForEncounter(self, encounterid):
        query = '''SELECT * FROM {} WHERE encounter_id = '{}' '''.format('curation_joint_exam', encounterid)
        logger.info('query: {}'.format(query))
        return JointExam.objects.raw(query)
