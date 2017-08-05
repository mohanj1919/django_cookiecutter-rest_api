from django.db import models
from django.conf import settings
from django.utils import timezone

from ..models import CRFTemplate
from ...utilities.base_model import BaseModel

class CRFTemplateQuestionManager(models.Manager):
    def get_crf_template_question(self, question_id):
        try:
            return CRFTemplateQuestion.objects.get(question_id=question_id, is_active=True)
        except CRFTemplateQuestion.DoesNotExist as err:
            raise err


class CRFTemplateQuestion(BaseModel):
    class Meta:
        # https://docs.djangoproject.com/en/1.10/ref/models/options/#db-table
        db_table = 'curation_crf_template_question'
        unique_together = (("crf_template", "question_id"), ("crf_template", "text"))

    objects = CRFTemplateQuestionManager()

    id = models.AutoField(primary_key=True)
    is_active = models.BooleanField(default=True, db_index=True)
    crf_template = models.ForeignKey(CRFTemplate, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField(null=False)
    question_id = models.IntegerField(null=False,)
    question_type = models.TextField(null=False,)
    responses = models.TextField(null=True, blank=True)
    parent_question = models.TextField(null=True, blank=True)
    parent_condition = models.TextField(null=True, blank=True)
    parent_response = models.TextField(null=True, blank=True)
    note = models.TextField(null=True, blank=True)
