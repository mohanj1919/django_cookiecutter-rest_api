from rest_framework import serializers
from ..models import Procedure

class ProcedureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Procedure
        fields = '__all__'
