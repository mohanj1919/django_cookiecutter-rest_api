from django.db import transaction
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import detail_route, list_route

from ..models import AdminSetting
from ..serializers import AdminSettingSerializer


class AdminSettingsView(mixins.ListModelMixin,
                    mixins.RetrieveModelMixin,
                    viewsets.GenericViewSet):
    """
    API endpoints for listing/inserting/updating settings data
    """
    queryset = AdminSetting.objects.all()
    serializer_class = AdminSettingSerializer
    permission_classes = (permissions.IsAuthenticated,)

    @transaction.atomic
    def create(self, requests):
        """
        Create/Update curation app settings
        """
        data = requests.data
        serializer = self.get_serializer(data=data, many=True)
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
