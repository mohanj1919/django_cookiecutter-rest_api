from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.response import Response

from ...utilities.generic_view_set import CustomGenericAPIView
from ...utilities.list_view_mixin import ListModelGenericViewMixin
from ..models import Provider, Cohort

from ..serializers.provider import ProviderSerializer


class ProviderListView(CustomGenericAPIView,
                       ListModelGenericViewMixin):
    queryset = Provider.objects.all()
    serializer_class = ProviderSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def filter_query_set(self, search_param):
        query = Q(first_name__contains=search_param) | Q(
            last_name__icontains=search_param) | Q(
                type__icontains=search_param) | Q(
                    specialty_code__icontains=search_param) | Q(
                        id=search_param)
        return self.get_queryset().filter(query)

    def get_cohort(self, domain_id):
        return get_object_or_404(Cohort, id=domain_id)

    def get(self, request, domain_id):
        """
        Get all providers
        """
        cohort = self.get_cohort(domain_id)
        self.queryset = self.get_queryset().filter(cohort_id=cohort.id)
        return self.patinate_response(request)

    @transaction.atomic
    def post(self, request, domain_id):
        """
        Add a new provider
        """
        data = request.data
        cohort = self.get_cohort(domain_id)
        data['cohort'] = cohort.id
        data['created_by'] = request.user.email
        data['provider_id'] = data['id']
        serializer = self.get_serializer(data=data)

        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ProviderDetailsView(CustomGenericAPIView):
    queryset = Provider.objects.all()
    serializer_class = ProviderSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def _get_provider(self, cohort_id, appointment_id):
        return get_object_or_404(Provider, id=appointment_id, cohort_id=cohort_id)

    def get(self, request, domain_id, provider_id):
        """
        Get the information about a provider
        """
        provider = self._get_provider(domain_id, provider_id)
        serializer = self.get_serializer(provider)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, domain_id, provider_id):
        """
        Update a provider
        """
        data = request.data
        data['updated_by'] = request.user.email
        provider = self._get_provider(domain_id, provider_id)
        serializer = self.get_serializer(provider, data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, domain_id, provider_id):
        """
        Delete a provider
        """
        provider = self._get_provider(domain_id, provider_id)
        provider.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
