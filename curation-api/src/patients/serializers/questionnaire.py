from rest_framework import serializers
from ..models import Questionnaire

class QuestionnaireSerializer(serializers.ModelSerializer):
    class Meta:
        model = Questionnaire
        fields = '__all__'

class QuestionnaireRetrieveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Questionnaire
        exclude = ('updated_by', 'created_by', 'created_on', 'updated_on', 'patient_encounter')
