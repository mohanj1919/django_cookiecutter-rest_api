from rest_framework import serializers

from ..models import ProjectCohort, Cohort
from .cohort import CohortSerializer


class ProjectCohortListSerializer(serializers.ModelSerializer):
    cohort = CohortSerializer()
    class Meta:
        model = ProjectCohort
        fields = ('cohort_id', 'cohort')

class ProjectCohortSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectCohort
        fields = ('id', 'cohort_id', 'project_id', )

    @staticmethod
    def create_lambda(project_id, cohort_ids):
        project_cohorts = []
        for cohort_id in cohort_ids:
            # prepare project_cohort record
            project_cohorts.append(ProjectCohort(
                project_id=project_id, cohort_id=cohort_id))
        ProjectCohort.objects.bulk_create(project_cohorts)
        return project_cohorts

    @staticmethod
    def update_lambda(project_id, remove_cohort_ids):
        ProjectCohort.objects.filter(
            project_id=project_id, cohort_id__in=remove_cohort_ids).update(is_active=False)

    @staticmethod
    def get_project_cohort_details(project_id):
        """
        Returns the cohort detials in the project_id
        """
        project_cohorts = ProjectCohort.objects.filter(project_id=project_id, is_active=True)
        cohort_ids = [project_cohort.cohort_id for project_cohort in project_cohorts]
        if len(cohort_ids) > 0:
            cohorts = Cohort.objects.get_all_chort_details(cohort_ids)
            project_cohort_details = CohortSerializer(cohorts, many=True)
            return project_cohort_details.data
        else:
            return []
