from django.db import models
from django.conf import settings
from django.shortcuts import get_object_or_404

from .cohort import Cohort
# from .encounter import Encounter
# from .patient_demographic import PatientDemographic
from ...utilities.base_model import BaseModel
from ...common import enums


class PatientManager(models.Manager):
    use_in_migrations = True

    def get_patient_from_pending_list(self, cohort_id):
        return self.filter(curation_status=Patient.StatusType.pending,
                           is_active=True,
                           cohort_id=cohort_id).order_by('created_on').first()

    def get_patient_by_id(self, cohort_id, patient_id):
        return get_object_or_404(Patient,
                                 cohort_id=cohort_id,
                                 id=patient_id)


    def get_patient_by_patient_id(self, cohort_id, patient_id):
        return get_object_or_404(Patient,
                                 cohort_id=cohort_id,
                                 patient_id=patient_id)


class Patient(BaseModel):
    class Meta:
        # https://docs.djangoproject.com/en/1.10/ref/models/options/#db-table
        db_table = 'curation_patient'
        unique_together = (("cohort", "patient_id"),)

    id = models.AutoField(primary_key=True)
    patient_id = models.CharField(
        max_length=settings.STRING_MAX_DEFAULT_LENGTH, db_index=True)
    deceased = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    race = models.CharField(
        max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    sex_at_birth = models.CharField(
        max_length=10, choices=enums.Sex.choices, null=True)
    date_of_birth = models.CharField(
        max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    dob_is_year = models.BooleanField(default=False)

    cohort = models.ForeignKey(
        Cohort, on_delete=models.CASCADE, related_name='patients')

    objects = PatientManager()
