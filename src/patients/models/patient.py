from django.db import models
from django.conf import settings
from djchoices import DjangoChoices, ChoiceItem

from .cohort import Cohort
from ...utilities.base_model import BaseModel
from ...users.models import CurationUser

class PatientManager(models.Manager):
    use_in_migrations = True
    
    def get_patient_from_pending_list(self, cohort_id):
        return self.filter(curation_status=Patient.StatusType.pending, is_active=True, cohort_id=cohort_id).first()

class Patient(BaseModel):
    class Meta:
        # https://docs.djangoproject.com/en/1.10/ref/models/options/#db-table
        db_table = 'curation_patient'
        unique_together = (("cohort", "patient_id"),)

    id = models.AutoField(primary_key=True)
    patient_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, db_index=True)
    address_state = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    deceased_indicator= models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    employment_status= models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    ethnicity = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    language = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    living_situation_status = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    marital_status = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    pcp_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    race = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    sex = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    year_of_birth = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    year_of_death = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    zip_3 = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    cohort = models.ForeignKey(Cohort, on_delete=models.CASCADE, related_name='patients')

    class StatusType(DjangoChoices):
        pending = ChoiceItem("PENDING")
        inprogress = ChoiceItem("INPROGRESS")
        completed = ChoiceItem("COMPLETED")

    curation_status = models.CharField(max_length=20, choices=StatusType.choices, null=True, default=StatusType.pending)

    objects = PatientManager()