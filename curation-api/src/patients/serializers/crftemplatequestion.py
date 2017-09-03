from rest_framework import serializers
from ..models import CRFTemplateQuestion, CRFTemplate

from ...utilities.unique_together_validator import UniqueTogetherValidator


class IsCRFTemplateQuestionExists(object):
    def __call__(self, question_id):
        try:
            crf_template_question = CRFTemplateQuestion.objects.get(
                id=question_id)
        except CRFTemplateQuestion.DoesNotExist:
            raise serializers.ValidationError(
                'CRF template question details not found.')


class CRFTemplateQuestionListSerializer(serializers.ModelSerializer):
    is_active = serializers.BooleanField(required=False)
    # crf_template_id = serializers.IntegerField(required=False)

    class Meta:
        model = CRFTemplateQuestion
        fields = ('id', 'text', 'parent_condition',
                  'note', 'question_type', 'question_id', 'responses', 'parent_question', 'parent_response', 'is_active')


class CRFTemplateQuestionSerializer(serializers.Serializer):
    # Validations
    crf_template_id = serializers.IntegerField(required=False)
    question_type = serializers.CharField(required=True, max_length=100)
    responses = serializers.CharField(
        required=False, allow_null=True, allow_blank=True, max_length=250)
    parent_question = serializers.CharField(
        required=False, allow_null=True, allow_blank=True, max_length=250)
    parent_response = serializers.CharField(
        required=False, allow_null=True, allow_blank=True, max_length=250)
    tempId = serializers.IntegerField(required=False, allow_null=True)
    is_active = serializers.BooleanField(required=False,)
    # created_type = serializers.CharField(required=False, allow_null=True, allow_blank=True, max_length=100)
    parent_condition = serializers.CharField(
        required=False, allow_null=True, allow_blank=True, max_length=100)
    note = serializers.CharField(
        required=False, allow_null=True, allow_blank=True, max_length=100)

    question_id = serializers.IntegerField(required=True,)
    text = serializers.CharField(required=True, max_length=100,)

    class Meta:
        fields = ('id', 'is_active', 'text', 'crf_template_id', 'parent_condition',
                  'note', 'question_type', 'question_id',
                  'responses', 'parent_question', 'parent_response')
        validators = [
            UniqueTogetherValidator(
                queryset=CRFTemplateQuestion.objects.all(),
                fields=('crf_template_id', 'text', 'is_active'),
                message=(
                    'Values {checked_values} for {field_names} alrady exists.')
            ),
            UniqueTogetherValidator(
                queryset=CRFTemplateQuestion.objects.all(),
                fields=('crf_template_id', 'question_id'),
                message=(
                    'Values {checked_values} for {field_names} alrady exists.'),
                #("Question ID with this already exists in template.")
            )
        ]

    def create(self, validated_data):
        crfTemplateQuestion = self._create_template_question(validated_data)
        return crfTemplateQuestion

    def _create_template_question(self, template_question_data):
        crfTemplateQuestion = CRFTemplateQuestion.objects.create(
            **template_question_data)
        crfTemplateQuestion.save()
        return crfTemplateQuestion

    def update(self, instance, validated_data):
        instance.text = validated_data['text']
        instance.question_id = validated_data['question_id']
        instance.is_active = validated_data['is_active']
        instance.question_type = validated_data['question_type']
        instance.responses = validated_data['responses']
        instance.note = validated_data['note']
        instance.parent_question = validated_data['parent_question']
        instance.parent_condition = validated_data['parent_condition']
        instance.parent_response = validated_data['parent_response']
        instance.save()
        return instance


class CRFTemplateQuestionDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = CRFTemplateQuestion
        fields = ('text', 'parent_condition',
                  'note', 'question_type', 'question_id', 'responses',
                  'parent_question', 'parent_response')
