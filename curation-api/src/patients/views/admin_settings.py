from django.db import transaction
from rest_framework import mixins, permissions, status
from rest_framework.response import Response

from ..models import AdminSetting
from ..serializers import AdminSettingSerializer
from ...utilities import GenericViewSet


class AdminSettingsView(mixins.ListModelMixin,
                        mixins.RetrieveModelMixin,
                        GenericViewSet):
    """
    API endpoints for listing/inserting/updating settings data
    """
    queryset = AdminSetting.objects.filter(is_active=True)
    serializer_class = AdminSettingSerializer
    permission_classes = (permissions.IsAuthenticated, )

    @transaction.atomic
    def create(self, request):
        """
        Create/Update curation app settings
        """
        data = request.data
        serializer = self.get_serializer(data=data, many=True)
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @transaction.atomic
    def delete(self, request, pk=None):
        """
        Delete a curation app setting
        """
        instance = self.get_object()
        instance.is_active = False
        instance.updated_by = request.user.email
        instance.save()
        return Response(status=status.HTTP_200_OK)
