from rest_framework import serializers
from ..models import Event, ModuleInstance

from .appointment import AppointmentSerializer
from .encounter import EncounterRetrieveSerializer

class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModuleInstance
        fields = ('__all__')

class EventSerializer(serializers.ModelSerializer):
    appointment = AppointmentSerializer(many=True)
    module_instances = ModuleSerializer(many=True)
    encounter = EncounterRetrieveSerializer(many=True)

    class Meta:
        model = Event
        fields = (
            'id',
            'start',
            'end',
            'type',
            'encounter',
            'appointment',
            'module_instances',
            'related_events')
