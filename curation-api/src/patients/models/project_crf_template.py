from django.db import models
from django.conf import settings

from .project import Project
from .crf_template import CRFTemplate

from ...utilities.base_model import BaseModel

class ProjectCrfTemplateManager(models.Manager):
    use_in_migrations = True
    def get_all_active_crf_template_details(self, project_id, crf_template_ids):
        project_crf_templates = self.filter(is_active=True, project_id=project_id, crf_template_id__in=crf_template_ids)
        return project_crf_templates

class ProjectCrfTemplate(BaseModel):
    class Meta:
        # https://docs.djangoproject.com/en/1.10/ref/models/options/#db-table
        db_table = 'curation_project_crf_template'
        unique_together = (("project", "crf_template"),)

    objects = ProjectCrfTemplateManager()

    id = models.AutoField(primary_key=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='project_crf_templates')
    crf_template = models.ForeignKey(CRFTemplate, on_delete=models.CASCADE, related_name='related_crf_template')
    is_required = models.BooleanField(default=False, db_index=True)
