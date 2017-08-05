from rest_framework import serializers
from ..models import CRFQuestion


class CRFQuestionSerializer(serializers.ModelSerializer):
    # updated_on = serializers.DateTimeField(required=False)
    # created_on = serializers.DateTimeField(required=False)
    responses = serializers.CharField(required=False, allow_blank=True)
    class Meta:
        model = CRFQuestion
        fields = ('id', 'text', 'note', 'type', 'description', 'responses', 'is_active', 'created_on', 'updated_on')
