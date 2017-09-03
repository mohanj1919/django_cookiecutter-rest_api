from rest_framework import serializers
from ..models import Note

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = '__all__'

class NoteRetrieveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        exclude = ('updated_by', 'created_by', 'created_on', 'updated_on', 'patient_encounter')
