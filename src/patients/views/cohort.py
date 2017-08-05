from django.db import transaction
from django.db.models import Q
from django.http import Http404
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import detail_route, list_route
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from ...users.models import CurationUser
from ...utilities import ListModelViewMixin
from ..models import Cohort, Patient, ProjectCohort, ProjectCurator
from ..serializers import CohortSerializer, CohortListCreateSerializer


class CohortView(mixins.RetrieveModelMixin,
                 viewsets.GenericViewSet,
                 mixins.UpdateModelMixin,
                 ListModelViewMixin):
    """
    API endpoints for managing Cohort data
    """
    queryset = Cohort.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = CohortSerializer
    model = Cohort

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'bulk_create']:
            return CohortListCreateSerializer
        return CohortSerializer

    def get_queryset(self):
        queryset = Cohort.objects.all()
        reqeust_user = self.request.user
        if reqeust_user is not None:
            group = reqeust_user.groups.first()
            if group.name == 'curator':
                projectids = ProjectCurator.objects.filter(
                    curator_id=reqeust_user.id).values_list('project_id', flat=True)
                cohorts = list(ProjectCohort.objects.filter(
                    project_id__in=projectids).values_list('cohort_id', flat=True))
                queryset = queryset.filter(id__in=cohorts)
        return queryset

    def filter_query_set(self, search_param):
        query = Q(name__icontains=search_param) | Q(description__icontains=search_param)
        return self.get_queryset().filter(query)

    @detail_route(methods=['get'])
    def get_patient_ids(self, request, pk=None):
        cohort = self.get_object()
        projectids = ProjectCurator.objects.filter(curator_id=request.user.id).values_list('project_id', flat=True)
        cohorts = list(ProjectCohort.objects.filter(project_id__in=projectids).values_list('cohort_id', flat=True))

        if int(pk) not in cohorts:
            return Response(status=status.HTTP_204_NO_CONTENT)

        reqParams = request.GET
        search_param = reqParams.get('searchParam', default=None)

        if search_param:
            queryset = Patient.objects.filter(
                cohort_id=pk, patient_id__icontains=search_param).values_list('patient_id', flat=True)
            return Response(queryset)
        # queryset = Patient.objects.filter(cohort_id=pk).values_list('patient_id',flat = True)
        qset = cohort.patients.all().values_list('patient_id', flat=True)
        return Response(qset)

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
