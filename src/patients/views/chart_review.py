from django.db import transaction
from django.db.models import Q, Max, F
from django.http import Http404
from django.utils import timezone
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import list_route, detail_route
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from ...utilities import ListModelViewMixin
from ..models import (CRFTemplate, CRFTemplateQuestion, PatientChartReview,
                      PatientChartReviewQuestion, Patient, Project)
from ..serializers import (PatientChartReviewCreateSerializer,
                           PatientChartReviewRetrieveSerializer,
                           PatientChartReviewSerializer,
                           PatientChartReviewStatusSerializer,
                           PatientChartReviewListSerializer,
                           CRFTemplateDetailSerializer)
from ..serializers.patient_chart_review import PatientChartReviewDataSerializer
from ..serializers.patient_chart_review_question import PatientChartReviewQuestionRetrieveSerializer
from ..serializers.crftemplatequestion import CRFTemplateQuestionDataSerializer
from ..serializers.patient import PatientDataSerializer
from ..serializers.project import ProjectDataSeralizer
from ..serializers.cohort import CohortDataSerializer
from ...users.serializers.userSerializer import UserDataSerializer


class PatientChartReviewView(viewsets.GenericViewSet,
                             mixins.RetrieveModelMixin,
                             ListModelViewMixin):
    queryset = PatientChartReview.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = PatientChartReviewSerializer
    model = PatientChartReview

    def _get_object(self, pk):
        try:
            return PatientChartReview.objects.get(pk=pk)
        except PatientChartReview.DoesNotExist:
            raise Http404

    def get_serializer_class(self):
        if self.action == 'create' or self.action == 'update':
            return PatientChartReviewCreateSerializer
        if self.action == 'get_completed_chart_reviews':
            return PatientChartReviewListSerializer
        return PatientChartReviewSerializer

    def filter_query_set(self, search_param):
        query = Q(status__icontains=search_param)
        return self.get_queryset().filter(query)

    @list_route(methods=['get'])
    def answers(self, request):
        reqParams = request.GET
        project_id = reqParams.get('project_id', None)
        patient_id = reqParams.get('patient_id', None)
        crfTemplate_id = reqParams.get('crfTemplate_id', None)
        curator_id = reqParams.get('curator_id', request.user.id)

        try:
            patient = PatientChartReview.objects.get(
                project_id=project_id, patient_id=patient_id, curator_id=curator_id, crf_template_id=crfTemplate_id)
            patient = PatientChartReviewRetrieveSerializer(patient)
            return Response(patient.data, status=status.HTTP_200_OK)
        except PatientChartReview.DoesNotExist:
            return Response({}, status=status.HTTP_200_OK)

    def get_template_question_response(self, chart_review, template_question):
        try:
            question_response = PatientChartReviewQuestion.objects.get(
                patient_chart_review_id=chart_review.id,
                crf_template_question_id=template_question.id)
            question_response = PatientChartReviewQuestionRetrieveSerializer(
                question_response).data
            return question_response['responses']
        except PatientChartReviewQuestion.DoesNotExist:
            return None

    def get_chart_review_crf_template_data(self, chart_review):
        crf_template = chart_review.crf_template
        template_questions = crf_template.questions.all()
        questions = []
        for template_question in template_questions:
            question = CRFTemplateQuestionDataSerializer(
                template_question).data
            question['curation_response'] = self.get_template_question_response(
                chart_review, template_question)
            questions.append(question)
        crf_template_data = CRFTemplateDetailSerializer(crf_template).data
        crf_template_data['questions'] = questions
        return crf_template_data

    def get_template_data(self, chart_review):
        return self.get_chart_review_crf_template_data(chart_review)

    def get_chart_review_data(self, chart_reivews):
        response_data = {}
        response_data['project'] = ProjectDataSeralizer(
            chart_reivews.first().project).data
        response_data['cohort'] = CohortDataSerializer(
            chart_reivews.first().cohort).data
        response_data['patient'] = PatientDataSerializer(
            chart_reivews.first().patient).data
        response_data['curator'] = UserDataSerializer(
            chart_reivews.first().curator).data
        response_data['status'] = chart_reivews.first().status
        crf_templates = []
        for chart_review in chart_reivews:
            crf_templates.append(
                self.get_chart_review_crf_template_data(chart_review))
        response_data['crf_templates'] = crf_templates
        return response_data

    @list_route(methods=['get'])
    def get_chart_review_response(self, request):
        reqParams = request.GET
        project_id = reqParams.get('project_id', None)
        cohort_id = reqParams.get('cohort_id', None)
        patient_id = reqParams.get('patient_id', None)
        crfTemplate_id = reqParams.get('crfTemplate_id', None)
        # curator_id = reqParams.get('curator_id', None)

        try:
            queryset = PatientChartReview.objects.filter(project_id=project_id,
                                                         cohort_id=cohort_id,
                                                         patient__patient_id=patient_id)
            if crfTemplate_id is not None:
                queryset = queryset.filter(crf_template_id=crfTemplate_id)
            if request.user.groups.first().name == 'curator':
                queryset = queryset.filter(curator_id=request.user.id)
            # patient = PatientChartReviewDataSerializer(queryset, many=True)
            # return Response(patient.data, status=status.HTTP_200_OK)
            return Response(self.get_chart_review_data(queryset), status=status.HTTP_200_OK)
        except PatientChartReview.DoesNotExist:
            return Response({}, status=status.HTTP_200_OK)

    @list_route(methods=['get'])
    def get_chart_review_status(self, request):
        reqParams = request.GET
        project_id = reqParams.get('project_id', None)
        patient_id = reqParams.get('patient_id', None)
        curator_id = reqParams.get('curator_id', request.user.id)

        try:
            chart_review_data = PatientChartReview.objects.filter(
                project_id=project_id, patient_id=patient_id, curator_id=curator_id)
            chart_review_data = PatientChartReviewStatusSerializer(
                chart_review_data, many=True)
            return Response(chart_review_data.data, status=status.HTTP_200_OK)
        except PatientChartReview.DoesNotExist as er:
            return Response({'errors': er}, status=status.HTTP_404_NOT_FOUND)

    @transaction.atomic
    def create(self, request):
        data = request.data
        serializer = self.get_serializer(data=data)
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        # validate the question belongs to template or not.
        crf_template_id = data.get('crf_template_id')
        question_responses = data.get('question_responses')

        try:
            crf_template = CRFTemplate.objects.get(id=crf_template_id)
            for question_response in question_responses:
                crf_template_question_id = question_response.get(
                    'crf_template_question_id')
                crf_template.questions.get(id=crf_template_question_id)
        except (CRFTemplate.DoesNotExist, CRFTemplateQuestion.DoesNotExist):
            error_message = "crf_template_question_id does not exists in CRF Template crf_template_id: {crf_template_id}"
            raise ValidationError(
                {'errors': error_message.format(crf_template_id=crf_template_id)})

        patient = serializer.validated_data['patient_id']
        patient.curation_status = Patient.StatusType.inprogress
        patient.save()
        created_obj = serializer.save()
        chart_review = PatientChartReviewRetrieveSerializer(created_obj)
        return Response(chart_review.data, status=status.HTTP_201_CREATED)

    @transaction.atomic
    def update(self, request, pk=None):
        """
        Update the status of the chart review
        """
        data = request.data
        instance = self._get_object(pk)
        serializer = self.get_serializer(instance, data=data)
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        updated_obj = serializer.save()
        chart_review = PatientChartReviewRetrieveSerializer(updated_obj)
        return Response(chart_review.data, status=status.HTTP_200_OK)

    @transaction.atomic
    @list_route(methods=['POST'])
    def update_chart_review(self, request):
        """
        Update the status of the chart review
        """
        data = request.data
        project_id = data.get('project_id', None)
        patient_id = data.get('patient_id', None)
        crf_template_id = data.get('crf_template_id', None)
        cohort_id = data.get('cohort_id', None)
        instance = None
        try:
            instance = PatientChartReview.objects.get(
                project_id=project_id, patient_id=patient_id, crf_template_id=crf_template_id, cohort_id=cohort_id)
        except PatientChartReview.DoesNotExist:
            raise Http404
        serializer = self.get_serializer(instance, data=data)
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        updated_obj = serializer.save()
        chart_review = PatientChartReviewRetrieveSerializer(updated_obj)
        return Response(chart_review.data, status=status.HTTP_200_OK)

    def search_chart_review_data(self, project, cohort, patient):
        """
        Searches completed chart review data
        """
        queryset = PatientChartReview.objects.filter(
            status=PatientChartReview.StatusType.completed).order_by('patient', '-updated_on')

        if project is not None:
            queryset = queryset.filter(Q(project__name__icontains=project))
        if cohort is not None:
            queryset = queryset.filter(Q(cohort__name__icontains=cohort))
        if patient is not None:
            queryset = queryset.filter(patient__curation_status=Patient.StatusType.completed & Q(
                patient__patient_id__icontains=patient))

        queryset = queryset.distinct('patient')
        return queryset

    @list_route(methods=['get'])
    def get_completed_chart_reviews(self, request):
        """
        Gets all completed patient chart review data based on serach criteria.
        """
        reqParams = request.GET
        project = reqParams.get('project', None)
        cohort = reqParams.get('cohort', None)
        patient_id = reqParams.get('patient_id', None)
        queryset = self.search_chart_review_data(project, cohort, patient_id)
        page = self.paginate_queryset(queryset)
        data = []

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            data = serializer.data

        return self.get_paginated_response(data)
