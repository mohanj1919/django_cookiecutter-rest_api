from django.db import transaction
from rest_framework import status, viewsets, mixins, permissions
from rest_framework.response import Response
from rest_framework.decorators import detail_route, list_route

from ..models import Encounter
from ..serializers import EncounterSerializer


class EncounterView(mixins.ListModelMixin,
                    mixins.RetrieveModelMixin,
                    viewsets.GenericViewSet):
    """
    API endpoints for getting Patient data
    """
    queryset = Encounter.objects.all()
    serializer_class = EncounterSerializer
    permission_classes = (permissions.IsAuthenticated,)

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
