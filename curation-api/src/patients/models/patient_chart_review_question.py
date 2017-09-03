from django.db import models
from django.conf import settings

from ...utilities.base_model import BaseModel
from . import (PatientChartReview, CRFTemplateQuestion)


class PatientChartReviewQuestion(BaseModel):
    class Meta:
        # https://docs.djangoproject.com/en/1.10/ref/models/options/#db-table
        db_table = 'curation_patient_chart_review_question'

    id = models.AutoField(primary_key=True)
    patient_chart_review = models.ForeignKey(
        PatientChartReview, on_delete=models.CASCADE, related_name='questions_data')
    crf_template_question = models.ForeignKey(
        CRFTemplateQuestion, on_delete=models.CASCADE, related_name='question_responses')
    question_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=False)
    responses = models.TextField(null=True, blank=True)
    annotation_text = models.TextField(null=True, blank=True)
    annotation_responses = models.TextField(null=True, blank=True)
