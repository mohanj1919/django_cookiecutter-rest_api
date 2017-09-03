from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.response import Response

from ...utilities.generic_view_set import CustomGenericAPIView
from ...utilities.list_view_mixin import ListModelGenericViewMixin
from ..models import Appointment
from ..models.patient import Patient
from ..serializers.appointment import AppointmentSerializer


class AppointmentListView(CustomGenericAPIView,
                          ListModelGenericViewMixin):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def filter_query_set(self, search_param):
        query = Q(id__contains=search_param) | Q(
            patient__patient_id__icontains=search_param)
        return self.get_queryset().filter(query)

    def get_patient(self, domain_id, patient_id):
        return get_object_or_404(Patient, cohort_id=domain_id, id=patient_id)

    def get(self, request, domain_id, patient_id):
        """
        List all appointments for a patient
        """
        patient = self.get_patient(domain_id, patient_id)
        self.queryset = self.get_queryset().filter(patient_id=patient.id)
        return self.patinate_response(request)

    @transaction.atomic
    def post(self, request, domain_id, patient_id):
        """
        Add a new patient appointment
        """
        data = request.data
        patient = self.get_patient(domain_id, patient_id)
        data['patient'] = patient.id
        data['created_by'] = request.user.email
        serializer = self.get_serializer(data=data)

        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AppointmentDetailsView(CustomGenericAPIView):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def _get_appointment(self, patient_id, appointment_id):
        return get_object_or_404(Appointment, id=appointment_id, patient_id=patient_id)

    def get(self, request, domain_id, patient_id, appointment_id):
        """
        Find a patient's appointment by id
        """
        appointment = self._get_appointment(patient_id, appointment_id)
        serializer = self.get_serializer(appointment)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, domain_id, patient_id, appointment_id):
        """
        Update an existing patient appointment
        """
        data = request.data
        data['updated_by'] = request.user.email
        appointment = self._get_appointment(patient_id, appointment_id)
        serializer = self.get_serializer(appointment, data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, domain_id, patient_id, appointment_id):
        """
        Deletes an existing patient appointment
        """
        appointment = self._get_appointment(patient_id, appointment_id)
        appointment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
