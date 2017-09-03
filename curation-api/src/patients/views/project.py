from django.db import transaction
from django.db.models import Q
from django.http import Http404
from rest_framework import permissions, status
from rest_framework.response import Response

from ...utilities import ListModelViewMixin, GenericViewSet
from ..models import Project, ProjectCurator
from ..serializers import (
    ProjectCohortSerializer,
    ProjectCreateSeralizer,
    ProjectCrfTemplateSerializer,
    ProjectCuratorSerializer,
    ProjectSeralizer)
from ...users.serializers import UserSerializer
from ..serializers.project import ProjectListSeralizer

class ProjectView(GenericViewSet, ListModelViewMixin):
    """
    API endpoints for managing projects data
    """
    queryset = Project.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    model = Project
    curator_allowed_actions = ['retrieve', 'list']

    def _get_object(self, pk):
        try:
            return Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            raise Http404

    def get_serializer_class(self):
        if self.action in ['create', 'update']:
            return ProjectCreateSeralizer
        return ProjectListSeralizer

    def get_queryset(self):
        queryset = Project.objects.all()
        reqeust_user = self.request.user
        if reqeust_user is not None:
            user = UserSerializer(reqeust_user).data
            user_group = user['groups'][0]

            if user_group.get('name') == 'curator':
                queryset = self.get_curator_projects(user['email'])
        return queryset

    def filter_query_set(self, search_param):
        query = Q(name__icontains=search_param) | Q(description__icontains=search_param)
        return self.get_queryset().filter(query)

    def get_curator_projects(self, curator_email):
        project_ids = ProjectCurator.objects.filter(
            curator__email=curator_email).values_list('project_id', flat=True)
        queryset = Project.objects.filter(id__in=project_ids)
        return queryset

    def retrieve(self, request, pk=None):
        project = self._get_object(pk)
        project_seralizer = ProjectSeralizer(project)
        project_details = project_seralizer.data
        # Get the curation_project_cohort details
        project_details['project_curators'] = ProjectCuratorSerializer.get_project_curator_details(
            project.id)
        # Get the curation_project_curator details
        project_details['project_cohorts'] = ProjectCohortSerializer.get_project_cohort_details(
            project.id)
        # Get the curation_project_crf_template details
        project_details['project_crf_templates'] = ProjectCrfTemplateSerializer.get_project_crf_template_details(
            project.id)
        return Response(project_details, status=status.HTTP_200_OK)

    @transaction.atomic
    def create(self, request):
        data = request.data
        serializer = self.get_serializer(data=data)
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        validated_data = serializer.validated_data

        project = {
            "name": validated_data['name'],
            "description": validated_data['description'],
            "created_by": request.user.email
        }

        # create project
        project_serializer = ProjectSeralizer(data=project)
        if not project_serializer.is_valid():
            return Response({'errors': project_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        created_project = project_serializer.save()
        validated_data['created_project'] = created_project
        serializer.save()
        return Response(project_serializer.data, status=status.HTTP_201_CREATED)

    @transaction.atomic
    def update(self, request, pk=None):
        data = request.data
        project = self._get_object(pk)
        serializer = self.get_serializer(project, data=data)
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        project_serializer = ProjectSeralizer(project, data=data)
        if not project_serializer.is_valid():
            return Response({'errors': project_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
