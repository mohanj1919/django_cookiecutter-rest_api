from django.db import models
from django.conf import settings

from .patient import Patient
from ...utilities.base_model import BaseModel

class Appointment(BaseModel):
    class Meta:
        # https://docs.djangoproject.com/en/1.10/ref/models/options/#db-table
        db_table = 'curation_appointment'

    id = models.AutoField(primary_key=True)
    data_source_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, db_index=True, unique=True)
    provider_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=False)
    facility_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, db_index=True, null=False)
    start = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=False)

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointments', null=True)
