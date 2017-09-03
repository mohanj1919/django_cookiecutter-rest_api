from django.db import transaction
from django.db.models import Q
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.decorators import list_route
from django.shortcuts import get_object_or_404
from ..models import Encounter
from ..serializers import EncounterSerializer
from ..serializers.encounter import EncounterRetrieveSerializer

from ...utilities.generic_view_set import CustomGenericAPIView
from ...utilities.list_view_mixin import ListModelGenericViewMixin
from ..models.patient import Patient

class EncounterListView(CustomGenericAPIView,
                        ListModelGenericViewMixin):
    queryset = Encounter.objects.all()
    serializer_class = EncounterSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def filter_query_set(self, search_param):
        query = Q(id__contains=search_param) | Q(
            patient__patient_id__icontains=search_param)
        return self.get_queryset().filter(query)

    def get(self, request, domain_id, patient_id):
        """
        List all encounters
        """
        self.queryset = self.get_queryset().filter(patient_id=patient_id, cohort_id=domain_id)
        return self.patinate_response(request)

    def get_patient(self, domain_id, patient_id):
        return get_object_or_404(Patient, cohort_id=domain_id, id=patient_id)

    @transaction.atomic
    def post(self, request, domain_id, patient_id):
        """
        Create encounter for the patient
        """
        data = request.data
        self.get_patient(domain_id, patient_id)
        data['cohort_id'] = domain_id
        data['patient_id'] = patient_id
        data['encounter_id'] = data['id']
        data['created_by'] = request.user.email
        serializer = self.get_serializer(data=data)

        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class EncounterDetailsView(CustomGenericAPIView):
    queryset = Encounter.objects.all()
    serializer_class = EncounterSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def _get_encounter(self, domain_id, patient_id, encounter_id):
        return Encounter.objects.get_encounter(domain_id, patient_id, encounter_id)

    def get(self, request, domain_id, patient_id, encounter_id):
        """
        Find a patient's encounter by id
        """
        encounter = self._get_encounter(domain_id, patient_id, encounter_id)
        serializer = EncounterRetrieveSerializer(encounter)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, domain_id, patient_id, encounter_id):
        """
        Update an existing patient encounter
        """
        data = request.data
        data['updated_by'] = request.user.email
        encounter = self._get_encounter(domain_id, patient_id, encounter_id)
        serializer = self.get_serializer(encounter, data=data)
        serializer.is_valid(raise_exception=True)
        encounter = serializer.save()
        updated_encounter = EncounterRetrieveSerializer(encounter).data
        return Response(updated_encounter, status=status.HTTP_200_OK)

    def delete(self, request, domain_id, patient_id, encounter_id):
        """
        Deletes an existing patient encounter
        """
        encounter = self._get_encounter(domain_id, patient_id, encounter_id)
        encounter.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
