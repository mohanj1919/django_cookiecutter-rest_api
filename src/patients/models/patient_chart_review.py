from django.db import models
from djchoices import DjangoChoices, ChoiceItem

from ...users.models import CurationUser
from ...utilities.base_model import BaseModel

from . import (
    CRFTemplate,
    Project,
    Cohort,
    Patient
)

class PatientChartReview(BaseModel):
    class Meta:
        # https://docs.djangoproject.com/en/1.10/ref/models/options/#db-table
        db_table = 'curation_patient_chart_review'
        unique_together= (('project', 'cohort', 'crf_template', 'patient'))

    id = models.AutoField(primary_key=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='patient_project')
    cohort = models.ForeignKey(Cohort, on_delete=models.CASCADE, related_name='patient_cohort')
    crf_template = models.ForeignKey(CRFTemplate, on_delete=models.CASCADE, related_name='patient_crf_template', null=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='patient_chart_review')
    curator = models.ForeignKey(CurationUser, on_delete=models.CASCADE, related_name='curators_patient')

    class StatusType(DjangoChoices):
        notstarted = ChoiceItem("NOTSTARTED")
        inprogress = ChoiceItem("INPROGRESS")
        completed = ChoiceItem("COMPLETED")

    status = models.CharField(max_length=20, choices=StatusType.choices)
