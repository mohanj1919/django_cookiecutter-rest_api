from rest_framework import serializers

from ..models import CRFTemplateQuestion, CRFTemplate
from .crftemplatequestion import CRFTemplateQuestionSerializer, CRFTemplateQuestionListSerializer
from rest_framework.validators import UniqueValidator

class CRFTemplateListSerializer(serializers.ModelSerializer):
    questions = serializers.SerializerMethodField('get_active_template_questions')

    def get_active_template_questions(self, crf_template):
        queryset = crf_template.questions.filter(is_active=True)
        serializer = CRFTemplateQuestionListSerializer(queryset, many=True)
        question_ids = [ques['id'] for ques in serializer.data]
        return question_ids

    class Meta:
        model = CRFTemplate
        fields = ('id', 'name', 'description', 'questions')

class CRFTemplateRetrieveSerializer(serializers.ModelSerializer):
    questions = serializers.SerializerMethodField('get_active_template_questions')

    def get_active_template_questions(self, crf_template):
        queryset = crf_template.questions.filter(is_active=True)
        serializer = CRFTemplateQuestionListSerializer(queryset, many=True)
        return serializer.data

    class Meta:
        model = CRFTemplate
        fields = ('id', 'name', 'description', 'questions')


class IsCrfTemplateExists(object):
    def __call__(self, crf_template_id):
        crf_template = CRFTemplate.objects.get_crf_template_details(crf_template_id)
        if crf_template is None:
            raise serializers.ValidationError('CRF Template details not found.')


class CRFTemplateSerializer(serializers.ModelSerializer):
    questions = CRFTemplateQuestionListSerializer(many=True)

    name = serializers.CharField(validators=[
        UniqueValidator(
            queryset=CRFTemplate.objects.all(),
            message="CRF Template with this name already exists.",
            lookup='iexact'
        )], max_length=100
    )

    class Meta:
        model = CRFTemplate
        fields = ('id', 'name', 'description', 'questions')

    def create(self, validated_data):
        # pick slected columns
        template_data = {}
        template_data['name'] = validated_data.get('name')
        template_data['description'] = validated_data.get('description')
        crfTemplate = self._create_template_question(template_data)

        return crfTemplate

    def _create_template_question(self, template_data):
        crfTemplate = CRFTemplate.objects.create(**template_data)
        crfTemplate.save()
        return crfTemplate

    def update(self, instance, validated_data):
        # pick slected columns
        instance.name = validated_data.get('name')
        instance.description = validated_data.get('description')
        instance.save()

        return instance

class CRFTemplateDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = CRFTemplate
        fields = ('name', 'description')
