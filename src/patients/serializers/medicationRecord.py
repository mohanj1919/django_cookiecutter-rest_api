from rest_framework import serializers
from ..models import MedicationRecord

class MedicationRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicationRecord
        fields = '__all__'
