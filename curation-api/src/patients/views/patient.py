import logging

from django.db import transaction
from django.db.models import Q
from django.http import Http404
from rest_framework import permissions, status
from rest_framework.decorators import list_route
from rest_framework.response import Response

from ...utilities import ListModelViewMixin, GenericViewSet
from ..models import (
    Cohort,
    Patient,
    ProjectCohort,
    ProjectCurator,
    ProjectCohortPatient)
from ..serializers import PatientSerializer
from ..serializers.patient import PatientRetrieveSerializer

# Get an instance of a logger
logger = logging.getLogger(__name__)


class PatientView(ListModelViewMixin,
                  GenericViewSet):
    """
    API endpoints for managing Patients data
    """
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = (permissions.IsAuthenticated,)
    model = Patient
    curator_allowed_actions = ['complete_curation', 'get_patient_ids', 'fetch_next_patient']

    def filter_query_set(self, search_param):
        query = Q(id__contains=search_param) | Q(
            patient_id__icontains=search_param)
        return self.get_queryset().filter(query)

    def _get_object_by_patient_id(self, patient_id, cohort_id):
        try:
            patient = Patient.objects.get(
                patient_id=patient_id, cohort_id=cohort_id)
            return patient
        except Patient.DoesNotExist:
            raise Http404

    def _get_patient_details(self, patient, serializer_class):
        if patient is None:
            return []
        _serializer_class = serializer_class if serializer_class is not None else PatientSerializer
        serializer = _serializer_class(patient)
        patientData = serializer.data
        patientData['encounters'] = PatientSerializer().getPatientEncounters(
            patient.id,
            patient.cohort_id)
        return patientData

    def retrieve(self, request, pk=None):
        patient = self.get_object()
        patientData = self._get_patient_details(patient, PatientRetrieveSerializer)
        return Response(patientData, status=status.HTTP_200_OK)

    def is_patient_present_in_cohort(self, cohort_id, patient_id):
        try:
            cohort = Cohort.objects.get(id=cohort_id)
            return cohort.patients.filter(id=patient_id).count() > 0
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
                project_cohort_patient = ProjectCohortPatient.objects.get(
                    patient__patient_id=patient_id,
                    project_id=project_id,
                    curation_status=ProjectCohortPatient.CurationStatus.completed,
                    cohort_id=cohort_id)
                patient = project_cohort_patient.patient
                patient_data = self._get_patient_details(patient, PatientRetrieveSerializer)
                
                return Response(patient_data, status=status.HTTP_200_OK)
            except ProjectCohortPatient.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)

        # get assigned patient if any
        assigned_patient = self.get_assigned_patient_details(
            curator_id, project_id, cohort_id)

        # if the curator does not have any assigned patient then return a patient from pending list
        if assigned_patient is None:
            logger.info('Fetching next available patient for curation')
            # new_patient = Patient.objects.get_patient_from_pending_list(cohort_id)
            new_patient = ProjectCohortPatient.objects.get_patient_from_pending_list(
                cohort_id)
            if new_patient is not None and self.is_patient_present_in_cohort(cohort_id, new_patient.patient_id):
                new_patient.curation_status = ProjectCohortPatient.CurationStatus.inprogress
                new_patient.curator_id = curator_id
                new_patient.save()
                logger.info('Updating the curation status for the patient: %s ', patient_id)
                # self.save_patient_chart_review_data(project_id, curator_id, cohort_id, new_patient.id)
                patient = new_patient.patient
        elif assigned_patient is not None:
            patient = assigned_patient

        patient_data = self._get_patient_details(patient, PatientRetrieveSerializer)
        return Response(patient_data, status=status.HTTP_200_OK)

    def get_assigned_patient_details(self, curator_id, project_id, cohort_id):
        """
        Returns a patient who's curation is in-progress.
        """
        try:
            logger.info(
                'Getting already assigned patient assinged to curator %d', curator_id)
            patient_id = self.get_assigned_patient_id(
                curator_id, project_id, cohort_id)
            patient = Patient.objects.get(id=patient_id)
            return patient
        except Patient.DoesNotExist:
            logger.info('Assigned patient details not found ')
            return None

    def get_assigned_patient_id(self, curator_id, project_id, cohort_id):
        try:
            curation_project_cohort_patient = ProjectCohortPatient.objects.get(
                project_id=project_id,
                cohort_id=cohort_id,
                curator_id=curator_id,
                curation_status=ProjectCohortPatient.CurationStatus.inprogress)
            patient_id = curation_project_cohort_patient.patient_id
            return patient_id
        except ProjectCohortPatient.DoesNotExist:
            return None

    @list_route(methods=['post'])
    @transaction.atomic
    def complete_curation(self, request):
        data = request.data
        patient_id = data.get('patient_id', None)
        cohort_id = data.get('cohort_id', None)
        project_id = data.get('project_id', None)
        res = {'errors': {}}

        if patient_id is None:
            res['errors']['patient_id'] = ["this field is required"]
            return Response(res, status=status.HTTP_400_BAD_REQUEST)
        if cohort_id is None:
            res['errors']['cohort_id'] = ["this field is required"]
            return Response(res, status=status.HTTP_400_BAD_REQUEST)
        if project_id is None:
            res['errors']['project_id'] = ["this field is required"]
            return Response(res, status=status.HTTP_400_BAD_REQUEST)

        patient = self._update_patient_curation_status(
            project_id, cohort_id, patient_id)
        # patient = self._get_object_by_patient_id(patient_id, cohort_id)
        serializer = PatientSerializer(patient)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def _update_patient_curation_status(self, project_id, cohort_id, patient_id):
        """
        Gets a record from curation_project_cohort_patient table
        for the project, cohort and patient
        """
        try:
            curator = self.request.user
            curation_project_cohort_patient = ProjectCohortPatient.objects.get(
                project_id=project_id,
                cohort_id=cohort_id,
                patient__patient_id=patient_id,
                curator_id=curator.id)
            curation_project_cohort_patient.curation_status = ProjectCohortPatient.CurationStatus.completed
            curation_project_cohort_patient.updated_by = curator.email
            curation_project_cohort_patient.save()
            return curation_project_cohort_patient.patient
        except ProjectCohortPatient.DoesNotExist:
            return None

    @list_route(methods=['get'])
    def get_patient_ids(self, request):
        """
        Get the patients who's curation is completed across all projects.
        """
        req_params = request.GET
        reqeust_user = self.request.user

        patients = ProjectCohortPatient.objects.filter(
            curation_status=ProjectCohortPatient.CurationStatus.completed
        )

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
            patients = patients.filter(
                patient__patient_id__icontains=search_param)
        patient_ids = patients.values_list('patient__patient_id', flat=True)
        return Response(patient_ids, status=status.HTTP_200_OK)
