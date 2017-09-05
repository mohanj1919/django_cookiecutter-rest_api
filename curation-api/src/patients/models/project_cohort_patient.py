from django.db import models
from djchoices import DjangoChoices, ChoiceItem

from ...users.models import CurationUser
from . import Cohort, Project, Patient
from ...utilities.base_model import BaseModel


class ProjectCohortPatientManager(models.Manager):
    use_in_migrations = True
    def get_patient_from_pending_list(self, project_id, cohort_id):
        return self.filter(
            curation_status=ProjectCohortPatient.CurationStatus.pending,
            is_active=True,
            cohort_id=cohort_id,
            project_id=project_id
        ).first()

class ProjectCohortPatient(BaseModel):
    class Meta:
        # https://docs.djangoproject.com/en/1.10/ref/models/options/#db-table
        db_table = 'curation_project_cohort_patient'
        unique_together = (("cohort", "project", "patient", "curator"),)

    class CurationStatus(DjangoChoices):
        pending = ChoiceItem("PENDING")
        inprogress = ChoiceItem("INPROGRESS")
        completed = ChoiceItem("COMPLETED")

    id = models.AutoField(primary_key=True)
    cohort = models.ForeignKey(
        Cohort, on_delete=models.CASCADE, related_name='related_project_patient')
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name='related_cohort_patient')
    patient = models.ForeignKey(
        Patient, on_delete=models.CASCADE, related_name='related_project_cohort')
    curator = models.ForeignKey(CurationUser, on_delete=models.CASCADE,
                                related_name='related_project_cohort_patients', null=True)
    curation_status = models.CharField(max_length=20, choices=CurationStatus.choices,
                                       null=True, default=CurationStatus.pending)

    objects = ProjectCohortPatientManager()
