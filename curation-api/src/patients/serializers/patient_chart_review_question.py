from rest_framework import serializers
from ..models import PatientChartReviewQuestion


class PatientChartReviewQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientChartReviewQuestion
        fields = ('id', 'patient_chart_review_id', 'crf_template_question_id',
                  'question_id', 'responses', 'is_active', 'created_on', 'updated_on', 'annotation_text', 'annotation_responses')


class PatientChartReviewQuestionRetrieveSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientChartReviewQuestion
        fields = ('question_id', 'responses')
