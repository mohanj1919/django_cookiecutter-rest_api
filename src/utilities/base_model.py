from django.db import models

from django.utils import timezone

class BaseModel(models.Model):
    is_active = models.BooleanField(default=True, db_index=True)

    created_on = models.DateTimeField(db_index=True, auto_now_add=True,)
    created_by = models.CharField(max_length=256, null=True)

    updated_on = models.DateTimeField(db_index=True, auto_now=True,)
    updated_by = models.CharField(max_length=256, null=True)

    class Meta:
        abstract = True
