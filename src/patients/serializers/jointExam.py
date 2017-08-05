from rest_framework import serializers
from ..models import JointExam

class JointExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = JointExam
        fields = '__all__'
