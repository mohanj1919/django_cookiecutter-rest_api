from django.db import models
from django.conf import settings

from .project import Project
from ...users.models import CurationUser
from ...utilities.base_model import BaseModel

class ProjectCuratorManager(models.Manager):
    def get_all_active_curator_details(self, project_id):
        project_curators = self.filter(is_active=True).filter(project_id=project_id)
        return project_curators

class ProjectCurator(BaseModel):
    class Meta:
        # https://docs.djangoproject.com/en/1.10/ref/models/options/#db-table
        db_table = 'curation_project_curator'
        unique_together = (("project", "curator"),)

    objects = ProjectCuratorManager()

    id = models.AutoField(primary_key=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='project_curators')
    curator = models.ForeignKey(CurationUser, on_delete=models.CASCADE, related_name='related_projects')
