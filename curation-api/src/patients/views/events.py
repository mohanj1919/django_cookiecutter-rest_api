from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.response import Response

from ...utilities.generic_view_set import CustomGenericAPIView
from ...utilities.list_view_mixin import ListModelGenericViewMixin
from ..models import Event, Cohort, Patient

from ..serializers.events import EventSerializer


class EventListView(CustomGenericAPIView,
                     ListModelGenericViewMixin):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def filter_query_set(self, search_param):
        return self.get_queryset()

    def get_cohort(self, domain_id):
        return get_object_or_404(Cohort, id=domain_id)

    def get_patient(self, patient_id):
        return get_object_or_404(Patient, id=patient_id)

    def get(self, request, domain_id, patient_id):
        """
        Get all providers
        """
        cohort = self.get_cohort(domain_id)
        patient = self.get_patient(patient_id)
        self.queryset = self.get_queryset().filter(cohort_id=cohort.id)
        return self.patinate_response(request)


class EventDetailsView(CustomGenericAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def _get_event(self, cohort_id, patient_id, event_id):
        return get_object_or_404(Event, id=event_id, cohort_id=cohort_id, patient_id=patient_id)

    def get(self, request, domain_id, provider_id):
        """
        Get the information about a provider
        """
        provider = self._get_provider(domain_id, provider_id)
        serializer = self.get_serializer(provider)
        return Response(serializer.data, status=status.HTTP_200_OK)
