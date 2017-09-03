from rest_framework import serializers
from ..models import JointExam

class JointExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = JointExam
        fields = '__all__'

class JointExamRetrieveSerializer(serializers.ModelSerializer):
    class Meta:
        model = JointExam
        exclude = ('updated_by', 'created_by', 'created_on', 'updated_on', 'patient_encounter')
