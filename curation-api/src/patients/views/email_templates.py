from django.db import transaction
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.response import Response

from ...utilities import GenericViewSet
from ..models import EmailTemplate
from ..serializers import EmailTempaltesSerializer


class EmailTemplatesView(mixins.ListModelMixin,
                         mixins.RetrieveModelMixin,
                         mixins.UpdateModelMixin,
                         GenericViewSet):
    """
    API endpoints for listing/inserting/updating email templates data
    """
    queryset = EmailTemplate.objects.filter(is_active=True)
    serializer_class = EmailTempaltesSerializer
    permission_classes = (permissions.IsAuthenticated,)

    @transaction.atomic
    def create(self, request):
        """
        Create/Update email template details
        """
        data = request.data
        serializer = self.get_serializer(data=data)
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @transaction.atomic
    def delete(self, request, pk=None):
        """
        Delete a email template details
        """
        instance = self.get_object()
        instance.is_active = False
        instance.updated_by = request.user.email
        instance.save()
        return Response(status=status.HTTP_200_OK)
