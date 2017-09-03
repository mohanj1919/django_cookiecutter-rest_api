from django.db import models
from django.conf import settings

from ...utilities.base_model import BaseModel

class ModuleInstance(BaseModel):
    class Meta:
        # https://docs.djangoproject.com/en/1.10/ref/models/options/#db-table
        db_table = 'curation_module_instance'

    id = models.AutoField(primary_key=True)
    module_id = models.IntegerField(null=False)
    instance_id = models.IntegerField(null=False)
    type = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=False,)
