import logging

from django.db import transaction
from django.db.models import Q
from rest_framework import status
from rest_framework.response import Response

from ...utilities.generic_view_set import CustomGenericAPIView
from ...utilities.list_view_mixin import ListModelGenericViewMixin
from ..models import Patient, ProjectCohortPatient
from ..serializers import PatientSerializer
from ..serializers.patient import PatientListSerializer

# Get an instance of a logger
logger = logging.getLogger(__name__)


class CohortPatientsListView(CustomGenericAPIView, ListModelGenericViewMixin):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer

    def filter_query_set(self, search_param):
        query = Q(id__contains=search_param) | Q(
            patient_id__icontains=search_param)
        return self.get_queryset().filter(query)

    def get(self, request, domain_id):
        """
        Get all patients in a domain
        """
        self.serializer_class = PatientListSerializer
        self.queryset = self.get_queryset().filter(cohort_id=domain_id, is_active=True)
        return self.patinate_response(request)

    def create_project_patient(self, patient):
        project_patients = ProjectCohortPatient.objects.filter(cohort_id=patient.cohort_id).distinct('project_id')
        prepared_project_patients = []
        for project_patient in project_patients:
            prepared_project_patient = ProjectCohortPatient(
                project_id=project_patient.project_id,
                cohort_id=project_patient.cohort_id,
                patient_id=patient.id,
                curation_status=ProjectCohortPatient.CurationStatus.pending
            )
            prepared_project_patients.append(prepared_project_patient)
        ProjectCohortPatient.objects.bulk_create(prepared_project_patients)

    @transaction.atomic
    def post(self, request, domain_id):
        """
        Add a new patient to a domain
        """
        data = request.data
        data['cohort'] = domain_id
        data['created_by'] = request.user.email

        serializer = self.get_serializer(data=data)

        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        patient = serializer.save()
        self.create_project_patient(patient)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CohortPatientsDetailView(CustomGenericAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer

    def get(self, request, domain_id, patient_id):
        """
        Get information about a patient in the domain
        """
        patient = Patient.objects.get_patient_by_id(domain_id, patient_id)
        if patient is not None:
            serializer = self.get_serializer(patient)
            patient_data = serializer.data
            return Response(patient_data, status=status.HTTP_200_OK)

    @transaction.atomic
    def put(self, request, domain_id, patient_id):
        """
        Update a patient in a domain
        """
        data = request.data
        data['cohort'] = domain_id
        data['updated_by'] = request.user.email

        patient = Patient.objects.get_patient_by_id(domain_id, patient_id)
        serializer = self.get_serializer(patient, data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_200_OK)

    @transaction.atomic
    def delete(self, request, domain_id, patient_id):
        """
        Delete a patient in a domain
        """
        patient = Patient.objects.get_patient_by_id(domain_id, patient_id)
        patient.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
