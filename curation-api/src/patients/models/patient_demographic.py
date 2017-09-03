from django.db import models
from django.conf import settings

from ...utilities.base_model import BaseModel
from ...common import enums
from .patient import Patient

class PatientDemographic(BaseModel):
    class Meta:
        # https://docs.djangoproject.com/en/1.10/ref/models/options/#db-table
        db_table = 'curation_patient_demographic'

    id = models.AutoField(primary_key=True)
    patient_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH)
    curation_patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='demographics')
    recorded = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True)
    sex = models.CharField(max_length=10, choices=enums.Sex.choices, null=True)
