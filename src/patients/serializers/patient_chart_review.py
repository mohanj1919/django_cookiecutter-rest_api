from rest_framework import serializers

from ...users.models import CurationUser
from ...users.serializers.userSerializer import UserRetrieveSerializer, UserDataSerializer
from ..models import (Cohort, CRFTemplate, CRFTemplateQuestion, Patient,
                      PatientChartReview, PatientChartReviewQuestion, Project)
from .patient_chart_review_question import PatientChartReviewQuestionSerializer
# from ...utilities.unique_together_validator import UniqueTogetherValidator
from .cohort import CohortListCreateSerializer, CohortDataSerializer
from . import CRFTemplateDetailSerializer, ProjectSeralizer
from .crftemplatequestion import CRFTemplateQuestionListSerializer
from .patient import PatientDataSerializer
from .project import ProjectDataSeralizer


class PatientChartReviewListSerializer(serializers.ModelSerializer):
    cohort = CohortListCreateSerializer()
    # crf_template = CRFTemplateDetailSerializer()
    curator = UserRetrieveSerializer()
    project = ProjectSeralizer()
    patient_id = serializers.SerializerMethodField()

    def get_patient_id(self, chart_review):
        return chart_review.patient.patient_id

    class Meta:
        model = PatientChartReview
        fields = ('cohort_id', 'cohort', 'project', 'crf_template',
                  'curator', 'status', 'patient_id')


class PatientChartReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientChartReview
        fields = ('id', 'project_id', 'cohort_id', 'crf_template_id', 'patient_id',
                  'curator_id', 'status', 'is_active', 'created_on', 'updated_on')


class PatientChartReviewQuestionCreateSerializer(serializers.Serializer):
    crf_template_question_id = serializers.PrimaryKeyRelatedField(
        queryset=CRFTemplateQuestion.objects.all(), required=True)
    responses = serializers.CharField(
        required=False, allow_null=True, allow_blank=True)

    class Meta:
        fields = ('crf_template_question_id', 'responses')


class PatientChartReviewCreateSerializer(serializers.Serializer):
    patient_id = serializers.PrimaryKeyRelatedField(
        queryset=Patient.objects.all(), required=True)
    project_id = serializers.PrimaryKeyRelatedField(
        queryset=Project.objects.all(), required=True)
    cohort_id = serializers.PrimaryKeyRelatedField(
        queryset=Cohort.objects.all(), required=True)
    crf_template_id = serializers.PrimaryKeyRelatedField(
        queryset=CRFTemplate.objects.all(), required=True)
    curator = serializers.CharField(required=True)
    question_responses = PatientChartReviewQuestionCreateSerializer(
        many=True, required=True)
    status = serializers.ChoiceField(
        PatientChartReview.StatusType.choices, required=False)

    def validate_curator(self, email):
        try:
            curator = CurationUser.objects.get(email=email, is_active=True)
            return curator.id
        except CurationUser.DoesNotExist:
            raise serializers.ValidationError('Curator details not found.')

    class Meta:
        fields = ('id', 'project_id', 'cohort_id', 'crf_template_id', 'curator', 'patient_id',
                  'status', 'created_on', 'updated_on', 'crf_template_question_id', 'responses')
        # validators = [
        #     UniqueTogetherValidator(
        #         queryset=PatientChartReview.objects.all(),
        #         fields=('crf_template_id', 'project_id', 'cohort_id', 'patient_id',),
        #         message=('Patient is already assigned to a curator')
        #     )
        # ]

    def update(self, instance, validated_data):
        instance.status = validated_data.get('status')
        instance.save()
        return instance

    def create(self, validated_data):
        project = validated_data['project_id']
        cohort = validated_data['cohort_id']
        crf_template = validated_data['crf_template_id']
        patient = validated_data['patient_id']
        curator = validated_data['curator']

        try:
            chart_review = PatientChartReview.objects.get(
                project_id=project.id, cohort_id=cohort.id, curator_id=curator,
                patient_id=patient.id, crf_template_id=crf_template.id)

            if chart_review.status != PatientChartReview.StatusType.completed:
                chart_review.status = PatientChartReview.StatusType.inprogress
            chart_review.save()
        except PatientChartReview.DoesNotExist:
            chart_review_data = {
                'project_id': project.id,
                'cohort_id': cohort.id,
                'crf_template_id': crf_template.id,
                'patient_id': patient.id,
                'curator_id': curator,
                'status': PatientChartReview.StatusType.inprogress
            }
            chart_review = PatientChartReview(**chart_review_data)
            chart_review.save()

        if chart_review.status != PatientChartReview.StatusType.completed:
            self._create_chart_review_response(validated_data, chart_review)

        return chart_review

    def _create_chart_review_response(self, validated_data, chart_review):
        question_responses = validated_data['question_responses']
        chart_review_question_responses = []
        for question_response in question_responses:
            response = self._create_chart_review_question_response(
                question_response, chart_review)
            chart_review_question_responses.append(response)
        return chart_review_question_responses

    def _create_chart_review_question_response(self, validated_data, chart_review):
        crf_template_question = validated_data.get('crf_template_question_id')
        try:
            patient_chart_review_question_data = {
                'crf_template_question_id': crf_template_question.id,
                'question_id': crf_template_question.question_id,
                'responses': validated_data.get('responses')
            }
            chart_review_question = PatientChartReviewQuestion.objects.get(
                patient_chart_review_id=chart_review.id, crf_template_question_id=crf_template_question.id)
            chart_review_question_serializer = PatientChartReviewQuestionSerializer(
                chart_review_question, data=patient_chart_review_question_data)
            chart_review_question_serializer.is_valid(raise_exception=True)
            chart_review_question_serializer.save()
            return chart_review_question_serializer.data
        except PatientChartReviewQuestion.DoesNotExist:
            patient_chart_review_question_data = {
                'patient_chart_review_id': chart_review.id,
                'question_id': crf_template_question.question_id,
                'crf_template_question_id': crf_template_question.id,
                'responses': validated_data.get('responses')
            }
            patient_chart_review_question = PatientChartReviewQuestion(
                **patient_chart_review_question_data)
            patient_chart_review_question.save()
            chart_review_question_serializer = PatientChartReviewQuestionSerializer(
                patient_chart_review_question)
            return chart_review_question_serializer.data


class PatientChartReviewRetrieveSerializer(serializers.ModelSerializer):
    questions_data = PatientChartReviewQuestionSerializer(many=True)

    class Meta:
        model = PatientChartReview
        fields = ('id', 'project_id', 'cohort_id', 'crf_template_id', 'patient_id', 'curator_id',
                  'status', 'is_active', 'questions_data')


class PatientChartReviewDataSerializer(serializers.ModelSerializer):
    project = ProjectDataSeralizer()
    cohort = CohortDataSerializer()
    patient = PatientDataSerializer()
    curator = UserDataSerializer()

    class Meta:
        model = PatientChartReview
        fields = ('project', 'cohort', 'patient', 'curator',
                  'status', 'is_active',)


class PatientChartReviewStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientChartReview
        fields = ('id', 'project_id', 'cohort_id', 'crf_template_id', 'patient_id', 'curator_id',
                  'status', 'is_active')
