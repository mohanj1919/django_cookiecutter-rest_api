import logging

from rest_framework import serializers

from ..models import Cohort, ProjectCohort, ProjectCohortPatient, PatientChartReview
from .cohort import CohortSerializer

# Get an instance of a logger
logger = logging.getLogger(__name__)


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
            try:
                cohort = Cohort.objects.get(id=cohort_id)
                patient_ids = cohort.patients.all().values_list('id', flat=True)
                project_cohort_patients = [ProjectCohortPatient(
                    project_id=project_id, cohort_id=cohort_id, patient_id=patient_id) for patient_id in patient_ids]
                ProjectCohortPatient.objects.bulk_create(project_cohort_patients)
            except Cohort.DoesNotExist:
                raise serializers.ValidationError("cohort details not found")

        ProjectCohort.objects.bulk_create(project_cohorts)
        return project_cohorts


    @staticmethod
    def update_lambda(project_id, remove_cohort_ids):
        ProjectCohortSerializer._validate_project_cohort_details(project_id, remove_cohort_ids)
        ProjectCohort.objects.filter(
            project_id=project_id,
            cohort_id__in=remove_cohort_ids).delete()
        ProjectCohortPatient.objects.filter(
            project_id=project_id,
            cohort_id__in=remove_cohort_ids).delete()


    @staticmethod
    def _validate_project_cohort_details(project_id, cohorts):
        project_patients = ProjectCohortPatient.objects.filter(
            project_id=project_id,
            cohort_id__in=cohorts,
            curation_status__in=[ProjectCohortPatient.CurationStatus.inprogress, ProjectCohortPatient.CurationStatus.completed]
        ).distinct('cohort_id')
        if project_patients.count():
            _cohorts = list(project_patients.values_list('cohort__name', flat=True))
            _cohorts = ','.join(map(str, _cohorts))
            message = "Cannot delete cohorts '{}' which are involved in patient curation".format(_cohorts)
            res = {'errors': {}}
            res['errors']['cohorts'] = [message]
            raise serializers.ValidationError(res)


    @staticmethod
    def get_project_cohort_details(project_id):
        """
        Returns the cohort detials in the project_id
        """
        project_cohorts = ProjectCohort.objects.filter(
            project_id=project_id, is_active=True)
        cohort_ids = [
            project_cohort.cohort_id for project_cohort in project_cohorts]
        if cohort_ids:
            cohorts = Cohort.objects.get_all_chort_details(cohort_ids)
            project_cohort_details = CohortSerializer(cohorts, many=True)
            return project_cohort_details.data
        else:
            return []
