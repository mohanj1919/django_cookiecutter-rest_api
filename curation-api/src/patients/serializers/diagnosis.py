from rest_framework import serializers
from ..models import Diagnosis

class DiagnosisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diagnosis
        fields = ('__all__')

class DiagnosisRetrieveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diagnosis
        exclude = ('updated_by', 'created_by', 'created_on', 'updated_on', 'patient_encounter',)
