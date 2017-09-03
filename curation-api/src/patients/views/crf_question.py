from django.db import transaction
from django.db.models import Q
from django.http import Http404
from rest_framework import permissions, status, mixins
from rest_framework.response import Response
from rest_framework.decorators import list_route

from ..models import CRFQuestion
from ..serializers import CRFQuestionSerializer
from ...utilities import ListModelViewMixin, GenericViewSet


class CRFQuestionView(GenericViewSet,
                      mixins.RetrieveModelMixin,
                      ListModelViewMixin):
    queryset = CRFQuestion.objects.filter(is_active=True)
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = CRFQuestionSerializer
    model = CRFQuestion

    # def get_serializer_class(self):
    #     if self.action == 'create':
    #         return CRFQuestionSerializer
    #     return CRFQuestionSerializer

    def _get_object(self, pk):
        try:
            return CRFQuestion.objects.get(pk=pk)
        except CRFQuestion.DoesNotExist:
            raise Http404

    def filter_query_set(self, search_param):
        query = Q(text__icontains=search_param) | Q(
            description__icontains=search_param) | Q(
                type__icontains=search_param) | Q(responses__icontains=search_param)
        return self.get_queryset().filter(query)

    @transaction.atomic
    def create(self, request):
        data = request.data
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

    @transaction.atomic
    def update(self, request, pk=None):
        data = request.data
        instance = self._get_object(pk)
        instance.updated_by = self.request.user.email
        serializer = self.get_serializer(instance, data=data)
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
