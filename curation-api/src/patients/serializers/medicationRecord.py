from rest_framework import serializers
from ..models import Medication

class MedicationRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = '__all__'

class MedicationRecordRetrieveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        exclude = ('updated_by', 'created_by', 'created_on', 'updated_on', 'patient_encounter')
