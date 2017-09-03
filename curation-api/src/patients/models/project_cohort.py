from django.db import models
from django.conf import settings

from .cohort import Cohort
from .project import Project
from ...utilities.base_model import BaseModel

class ProjectCohortManager(models.Manager):
    def get_all_active_project_cohort_details(self, project_id):
        project_cohorts = self.filter(is_active=True).filter(project_id=project_id)
        return project_cohorts

class ProjectCohort(BaseModel):
    class Meta:
        # https://docs.djangoproject.com/en/1.10/ref/models/options/#db-table
        db_table = 'curation_project_cohort'
        unique_together = (("cohort", "project"),)

    objects = ProjectCohortManager()

    id = models.AutoField(primary_key=True)
    cohort = models.ForeignKey(Cohort, on_delete=models.CASCADE, related_name='related_project')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='related_cohorts')
