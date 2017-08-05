from django.db import transaction
from django.db.models import Q
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import list_route
from rest_framework.response import Response

from ..models import ProjectCohort, ProjectCurator, Project
from ..serializers.project import ProjectCohortDataSerializer
from ...utilities.list_view_mixin import ListModelViewMixin
from ...users.serializers import UserSerializer

class ProjectCohortView(viewsets.GenericViewSet, ListModelViewMixin):
    queryset = ProjectCohort.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ProjectCohortDataSerializer
    model = ProjectCohort

    def get_queryset(self):
        queryset = self.queryset
        reqeust_user = self.request.user
        if reqeust_user is not None:
            user = reqeust_user
            user_group = reqeust_user.groups.first()
            if user_group.name == 'curator':
                queryset = self.get_curator_projects(user.email)
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
