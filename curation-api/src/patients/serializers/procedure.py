from rest_framework import serializers
from ..models import Procedure

class ProcedureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Procedure
        fields = '__all__'

class ProcedureRetrieveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Procedure
        exclude = ('updated_by', 'created_by', 'created_on', 'updated_on', 'patient_encounter')
