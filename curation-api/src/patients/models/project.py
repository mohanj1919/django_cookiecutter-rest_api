from django.db import models
from django.conf import settings
from django.utils import timezone

from ...utilities.base_model import BaseModel

class ProjectManager(models.Manager):
    def get_project(self, project_id):
        try:
            project = self.get(id=project_id, is_active=True)
        except Project.DoesNotExist:
            return None

class Project(BaseModel):
    class Meta:
        # https://docs.djangoproject.com/en/1.10/ref/models/options/#db-table
        db_table = 'curation_project'

    objects = ProjectManager()

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, db_index=True, unique=True )
    description = models.TextField(null=True, max_length=250,)
