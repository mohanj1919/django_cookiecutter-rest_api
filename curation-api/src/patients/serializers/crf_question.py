from rest_framework import serializers
from ..models import CRFQuestion
from rest_framework.validators import UniqueValidator


class CRFQuestionSerializer(serializers.ModelSerializer):
    # updated_on = serializers.DateTimeField(required=False)
    # created_on = serializers.DateTimeField(required=False)
    responses = serializers.CharField(required=False, allow_blank=True)
    text = serializers.CharField(validators=[
        UniqueValidator(
            queryset=CRFQuestion.objects.all(),
            message="Question already exists.",
            lookup='iexact')
    ])

    class Meta:
        model = CRFQuestion
        fields = ('id', 'text', 'note', 'type', 'description',
                  'responses', 'is_active', 'created_on', 'updated_on')
