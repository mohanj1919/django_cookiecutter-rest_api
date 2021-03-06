from rest_framework import serializers

from ..models import ProjectCurator
from ...users.models import CurationUser
from ...users.serializers import UserRetrieveSerializer

class ProjectCuratorSerializer(serializers.ModelSerializer):
    # related_curator = UserRetrieveSerializer()
    class Meta:
        model = ProjectCurator
        fields = ('id', 'curator_id', 'project_id',)

    @staticmethod
    def create_lambda(project_id, curator_ids):
        project_curators = []
        for curator_id in curator_ids:
            # prepare project_curator record
            project_curators.append(ProjectCurator(
                project_id=project_id, curator_id=curator_id))
        ProjectCurator.objects.bulk_create(project_curators)
        return project_curators

    @staticmethod
    def in_activate_lambda(project_id, remove_curator_ids):
        ProjectCurator.objects.filter(
            project_id=project_id, curator_id__in=remove_curator_ids).update(is_active=False)

    @staticmethod
    def create_project_curators(project_id, curator_ids):
        """
        Create a record in curation_project_curator table for this project
        """
        project_curators = []
        for curator_id in curator_ids:
            project_curator = ProjectCurator(
                curator_id=curator_id, project_id=project_id)
            project_curator.save()
            project_curators.append(project_curator)
        return project_curators

    @staticmethod
    def get_project_curator_details(project_id):
        """
        Returns the curators detials assigned to project_id
        """
        project_curators = ProjectCurator.objects.filter(project_id=project_id, is_active=True)
        curator_ids = [project_curator.curator_id for project_curator in project_curators]
        if len(curator_ids) > 0:
            curators = CurationUser.objects.get_user_details(curator_ids)
            project_curator_details = UserRetrieveSerializer(curators, many=True)
            return project_curator_details.data
        else:
            return []
