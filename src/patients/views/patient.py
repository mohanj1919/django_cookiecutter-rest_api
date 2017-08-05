import logging
from django.db import transaction
from django.db.models import Q
from django.http import Http404
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import detail_route, list_route
from rest_framework.response import Response

# Get an instance of a logger
logger = logging.getLogger(__name__)

from ...utilities.list_view_mixin import ListModelViewMixin
from ..models import Cohort, Encounter, Patient, PatientChartReview, ProjectCrfTemplate, ProjectCurator, ProjectCohort
from ..serializers import PatientSerializer
from ...users.serializers.userSerializer import UserSerializer


class PatientView(ListModelViewMixin,
                  viewsets.GenericViewSet):
    """
    API endpoints for managing Patients data
    """
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = (permissions.IsAuthenticated,)
    model = Patient

    def filter_query_set(self, search_param):
        query = Q(id__icontains=search_param) | Q(
            patient_id__icontains=search_param)
        return self.get_queryset().filter(query)

    def _get_object_by_patient_id(self, patient_id):
        try:
            patient = Patient.objects.get(patient_id=patient_id)
            return patient
        except Patient.DoesNotExist:
            raise Http404

    def _get_patient_details(self, patient):
        if patient is None:
            return []
        serializer = PatientSerializer(patient)
        patientData = serializer.data
        patientData['encounters'] = PatientSerializer(
        ).getPatientEncounters(patient.patient_id)
        return patientData

    def retrieve(self, request, pk=None):
        patient = self.get_object()
        patientData = self._get_patient_details(patient)
        return Response(patientData, status=status.HTTP_200_OK)

    def is_patient_present_in_cohort(self, cohort_id, patient_id):
        try:
            cohort = Cohort.objects.get(id=cohort_id)
            return cohort.patients.filter(patient_id=patient_id).count() > 0
        except Cohort.DoesNotExist:
            return False

    @list_route(methods=['get'])
    def fetch_next_patient(self, request):
        """
        Returns a patient to whom curation is pending.
        """
        req_params = request.GET
        cohort_id = req_params.get('cohort_id', None)
        project_id = req_params.get('project_id', None)
        curator_id = request.user.id if request.user is not None else None
        patient_id = req_params.get('patient_id', None)
        patient = None

        if patient_id is not None:
            try:
                patient = Patient.objects.get(
                    patient_id=patient_id, curation_status=Patient.StatusType.completed)
                patient_data = self._get_patient_details(patient)
                return Response(patient_data, status=status.HTTP_200_OK)
            except Patient.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)

        # get assigned patient if any
        assigned_patient = self.get_assigned_patient_details(curator_id, project_id, cohort_id)

        # if the curator does not have any assigned patient then return a patient from pending list
        if assigned_patient is None:
            logger.info('Fetching next available patient for curation')
            new_patient = Patient.objects.get_patient_from_pending_list(cohort_id)
            if new_patient is not None and self.is_patient_present_in_cohort(cohort_id, new_patient.patient_id):
                new_patient.curation_status = Patient.StatusType.inprogress
                new_patient.save()
                logger.info('Updating the curation status for the patient: %d ', patient_id)
                self.save_patient_chart_review_data(
                    project_id, curator_id, cohort_id, new_patient.id)
                patient = new_patient
        elif assigned_patient is not None:
            patient = assigned_patient

        patient_data = self._get_patient_details(patient)
        return Response(patient_data, status=status.HTTP_200_OK)

    def save_patient_chart_review_data(self, project_id, curator_id, cohort_id, patient_id):
        logger.info('Creating chart review record for the patient: %d ', patient_id)
        project_crf_templates = ProjectCrfTemplate.objects.filter(
            project_id=project_id)
        patient_chart_reviews = []
        for project_crf_tempalte in project_crf_templates:
            patient_chart_review = PatientChartReview(project_id=project_id,
                                                      curator_id=curator_id,
                                                      patient_id=patient_id,
                                                      cohort_id=cohort_id,
                                                      crf_template_id=project_crf_tempalte.crf_template_id, status=PatientChartReview.StatusType.notstarted)
            patient_chart_reviews.append(patient_chart_review)

        PatientChartReview.objects.bulk_create(patient_chart_reviews)

    def get_assigned_patient_details(self, curator_id, project_id, cohort_id):
        """
        Returns a patient who's curation is pending.
        """
        try:
            logger.info('Getting already assigned patient ')
            patient_id = self.get_assigned_patient_id(
                curator_id, project_id, cohort_id)
            patient = Patient.objects.get(id=patient_id)
            return patient
        except Patient.DoesNotExist:
            logger.info('Assigned patient details not found ')
            return None

    def get_assigned_patient_id(self, curator_id, project_id, cohort_id):
        patient_chart_review = PatientChartReview.objects.filter(curator_id=curator_id,
                                                                 project_id=project_id,
                                                                 cohort_id=cohort_id,
                                                                 status__in=[
                                                                     PatientChartReview.StatusType.notstarted,
                                                                     PatientChartReview.StatusType.inprogress
                                                                 ]).first()
        patient_id = patient_chart_review.patient_id if patient_chart_review is not None else None
        return patient_id

    @transaction.atomic
    def create(self, requests):
        data = requests.data
        serializer = self.get_serializer(data=data)
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @list_route(methods=['post'])
    @transaction.atomic
    def bulk_create(self, request):
        data = request.data
        serializer = self.get_serializer(data=data, many=True)
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @list_route(methods=['post'])
    @transaction.atomic
    def complete_curation(self, request):
        data = request.data
        patient_id = data.get('patient_id', None)
        if patient_id is None:
            res = {
                'errors': {
                    'patient_id': ["this field is required"]
                }
            }
            return Response(res, status=status.HTTP_400_BAD_REQUEST)
        patient = self._get_object_by_patient_id(data.get('patient_id'))
        patient.curation_status = Patient.StatusType.completed
        patient.save()
        serializer = PatientSerializer(patient)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @list_route(methods=['get'])
    def get_patient_ids(self, request):
        """
        Get the patients who's curation is completed across all projects.
        """
        req_params = request.GET
        reqeust_user = self.request.user

        patients = Patient.objects.filter(
            curation_status=Patient.StatusType.completed)

        if reqeust_user is not None:
            group = reqeust_user.groups.first()
            if group.name == 'curator':
                projectids = ProjectCurator.objects.filter(
                    curator_id=reqeust_user.id).values_list('project_id', flat=True)
                cohorts = list(ProjectCohort.objects.filter(
                    project_id__in=projectids).values_list('cohort_id', flat=True))
                patients = patients.filter(cohort__id__in=cohorts)

        search_param = req_params.get('searchParam', default=None)

        if search_param:
            patients = patients.filter(patient_id__icontains=search_param)

        patient_ids = patients.values_list('patient_id', flat=True)
        return Response(patient_ids, status=status.HTTP_200_OK)
