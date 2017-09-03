from django.db import models
from django.conf import settings

from ...utilities.base_model import BaseModel
from ...common import enums

from .module_instance import ModuleInstance
from .appointment import Appointment
from .encounter import Encounter

class Event(BaseModel):
    class Meta:
        # https://docs.djangoproject.com/en/1.10/ref/models/options/#db-table
        db_table = 'curation_event'

    id = models.AutoField(primary_key=True)
    start = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=False,)
    end = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=False,)
    type = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=False, choices=enums.EventType.choices)
    related_events = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True)
    module_instances = models.ForeignKey(ModuleInstance, on_delete=models.CASCADE, related_name='module_events')
    appointments = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='appointment_events')
    encounters = models.ForeignKey(Encounter, on_delete=models.CASCADE, related_name='encounter_events')
