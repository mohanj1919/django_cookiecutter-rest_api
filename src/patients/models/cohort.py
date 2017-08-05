from django.db import models
from django.conf import settings

from ...utilities.base_model import BaseModel

class CohortManager(models.Manager):
    def get_all_chort_details(self, cohort_ids):
        curators = self.filter(id__in=cohort_ids, is_active=True)
        return curators

class Cohort(BaseModel):
    class Meta:
        # https://docs.djangoproject.com/en/1.10/ref/models/options/#db-table
        db_table = 'curation_cohort'

    def __str__(self):
        return self.name

    objects = CohortManager()

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, db_index=True, unique=True)
    description = models.TextField(null=True,)
