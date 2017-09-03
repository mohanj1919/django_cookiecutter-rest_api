from rest_framework import serializers
from ..models import Result

class ResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = Result
        fields = '__all__'

class ResultRetrieveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Result
        exclude = ('updated_by', 'created_by', 'created_on', 'updated_on', 'patient_encounter')
