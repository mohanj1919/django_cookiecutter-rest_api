from django.db.models import Q
from rest_framework import permissions

from ..models import ProjectCohort, ProjectCurator
from ..serializers.project import ProjectCohortDataSerializer
from ...utilities import (
    ListModelViewMixin,
    GenericViewSet)


class ProjectCohortView(GenericViewSet, ListModelViewMixin):
    queryset = ProjectCohort.objects.filter(is_active=True)
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ProjectCohortDataSerializer
    model = ProjectCohort
    curator_allowed_actions = ['list']

    def get_queryset(self):
        queryset = self.queryset
        reqeust_user = self.request.user
        if GenericViewSet._is_curator(reqeust_user):
            queryset = self.get_curator_projects(reqeust_user.email)
        return queryset

    def get_curator_projects(self, curator_email):
        project_ids = ProjectCurator.objects.filter(
            curator__email=curator_email).values_list('project_id', flat=True)
        queryset = ProjectCohort.objects.filter(project__id__in=project_ids)
        return queryset

    def filter_query_set(self, search_param):
        query = Q(cohort__name__icontains=search_param) \
            | Q(cohort__description__icontains=search_param) \
            | Q(project__name__icontains=search_param) \
            | Q(project__description__icontains=search_param)
        return ProjectCohort.objects.filter(query)
