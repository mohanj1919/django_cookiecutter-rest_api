from rest_framework import serializers
from ..models import Observation

class ObservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Observation
        fields = '__all__'

class ObservationRetrieveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Observation
        exclude = ('updated_by', 'created_by', 'created_on', 'updated_on', 'patient_encounter')
