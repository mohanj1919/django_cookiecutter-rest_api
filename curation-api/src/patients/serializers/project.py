import logging

from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from . import (
    CohortSerializer,
    IsCohortExists,
    IsCrfTemplateExists,
    ProjectCohortSerializer,
    ProjectCrfTemplateSerializer,
    ProjectCuratorSerializer
)
from ...users.serializers.userSerializer import IsCuratorExists, isUserHasRole
from ..models import (
    PatientChartReview,
    Project,
    ProjectCohort,
    ProjectCohortPatient,)
from .project_cohort import ProjectCohortListSerializer
# from .patient_chart_review import PatientChartReviewListSerializer

# Get an instance of a logger
logger = logging.getLogger(__name__)


class ProjectListSeralizer(serializers.ModelSerializer):
    cohorts = serializers.SerializerMethodField()
    patient_stats = serializers.SerializerMethodField()

    def get_cohorts(self, project):
        project_cohorts = ProjectCohort.objects.filter(project_id=project.id, is_active=True)
        cohorts = ProjectCohortListSerializer(project_cohorts, many=True)
        cohorts = [cohort_data.get('cohort') for cohort_data in cohorts.data]
        return cohorts

    def get_patient_stats(self, instance):
        project_cohort_patients = ProjectCohortPatient.objects.filter(project_id=instance.id)
        in_progress_patients_count = project_cohort_patients.filter(
            curation_status=ProjectCohortPatient.CurationStatus.inprogress).count()
        completed_patients_count = project_cohort_patients.filter(
            curation_status=ProjectCohortPatient.CurationStatus.completed).count()
        pending_patients_count = project_cohort_patients.filter(
            curation_status=ProjectCohortPatient.CurationStatus.pending).count()
        patient_stats = {
            'in_progress': in_progress_patients_count,
            'completed': completed_patients_count,
            'pending': pending_patients_count,
            'total': project_cohort_patients.count()
        }
        return patient_stats

    class Meta:
        model = Project
        fields = ('id', 'name', 'description', 'cohorts', 'patient_stats')  # , 'patient_project')


class ProjectSeralizer(serializers.ModelSerializer):
    name = serializers.CharField(validators=[
        UniqueValidator(
            queryset=Project.objects.all(),
            message="Project with this name already exists.",
            lookup='iexact'
        )], max_length=100)

    class Meta:
        model = Project
        fields = ('id', 'name', 'description')


class curator_ids(serializers.ListField):
    id = serializers.IntegerField()


class cohort_ids(serializers.ListField):
    id = serializers.IntegerField()


class crf_templates(serializers.Serializer):
    id = serializers.IntegerField(validators=[IsCrfTemplateExists()])
    is_required = serializers.BooleanField(required=False)


class ProjectCreateSeralizer(serializers.Serializer):
    name = serializers.CharField(required=True, max_length=100)
    description = serializers.CharField(required=False, max_length=250)
    curators = curator_ids(validators=[IsCuratorExists()], required=False)
    cohorts = cohort_ids(validators=[IsCohortExists()], required=False)
    crf_templates = crf_templates(many=True, required=False)

    class Meta:
        fields = ('name', 'description', 'curators', 'cohorts', 'crf_templates')

    def create(self, validated_data):
        """
        Creates project with validated data
        """
        request = self.context['request']
        validated_data['created_by'] = request.user.email
        created_project = validated_data.get('created_project')
        _cohort_ids = validated_data.get("cohorts", [])
        _curator_ids = validated_data.get("curators", [])
        _crf_templates = validated_data.get("crf_templates", [])

        # create project_cohorts
        ProjectCohortSerializer.create_lambda(created_project.id, _cohort_ids)

        # create project_curators
        ProjectCuratorSerializer.create_lambda(created_project.id, _curator_ids)

        # create project_crf_template
        ProjectCrfTemplateSerializer.create_crf_templates(created_project.id, _crf_templates)

        return created_project

    def get_all_project_details(self, project):
        project_details = {}
        if project is not None:
            project_details['cohorts'] = project.related_cohorts.filter(is_active=True)
            project_details['curators'] = project.project_curators.filter(is_active=True)
            project_details['crf_templates'] = project.project_crf_templates.filter(is_active=True)
        return project_details

    def upsert_project_dependents(self, project_id, object_ids_in_req, object_ids_in_db, create_lambda, update_lambda):
        # get the cohort/curator ids present in req and not in db
        if object_ids_in_db is not None:
            new_object_ids = list(set(object_ids_in_req) - set(object_ids_in_db))

            if create_lambda is not None:
                create_lambda(project_id, new_object_ids)

            remove_objects_ids = list(set(object_ids_in_db) - set(object_ids_in_req))
            # update project dependent records
            if update_lambda is not None:
                update_lambda(project_id, remove_objects_ids)

    def upsert_project_crf_templates(self, project_id, templates_in_req, template_ids_in_db):
        if template_ids_in_db is not None:
            # self._validate_project_template_details(project_id, template_ids_in_db)
            object_ids_in_req = [template['id'] for template in templates_in_req]
            remove_objects_ids = list(set(template_ids_in_db) - set(object_ids_in_req))
            if remove_objects_ids:
                self._validate_project_template_details(project_id, remove_objects_ids)

            # delete all the template details and insert the updated details
            ProjectCrfTemplateSerializer.delete_crf_templates(project_id, template_ids_in_db)

            # create project_crf_template
            ProjectCrfTemplateSerializer.create_crf_templates(project_id, templates_in_req)

    def _validate_project_template_details(self, project_id, crf_template_ids):
        patient_chart_reviews = PatientChartReview.objects.filter(
            project_id=project_id,
            status__in=[
                PatientChartReview.StatusType.inprogress,
                PatientChartReview.StatusType.completed],
            crf_template_id__in=crf_template_ids).distinct('crf_template_id')
        if patient_chart_reviews:
            _templates = list(patient_chart_reviews.values_list('crf_template__name', flat=True))
            _templates = ','.join(map(str, _templates))
            message = "Cannot delete CRF templates '{}' which are involved in patient curation".format(_templates)
            res = {'errors': {}}
            res['errors']['crf_templates'] = [message]
            raise serializers.ValidationError(res)

    def _update_project_dependents(self, project, validated_data):
        curators = validated_data.get('curators', [])
        cohorts = validated_data.get('cohorts', [])
        _crf_templates = validated_data.get('crf_templates', [])

        project_details = self.get_all_project_details(project)
        project_cohorts = project_details['cohorts']
        project_curators = project_details['curators']
        project_crf_templates = project_details['crf_templates']

        cohorts_in_db = [obj.cohort_id for obj in project_cohorts if project_cohorts is not None]
        curators_in_db = [obj.curator_id for obj in project_curators if project_curators is not None]
        crf_templates_in_db = [
            obj.crf_template_id for obj in project_crf_templates if project_crf_templates is not None]

        self.upsert_project_dependents(
            project.id,
            curators,
            curators_in_db,
            ProjectCuratorSerializer.create_lambda,
            ProjectCuratorSerializer.in_activate_lambda)
        self.upsert_project_dependents(
            project.id,
            cohorts,
            cohorts_in_db,
            ProjectCohortSerializer.create_lambda,
            ProjectCohortSerializer.update_lambda)
        self.upsert_project_crf_templates(project.id, _crf_templates, crf_templates_in_db)

    def update(self, instance, validated_data):
        instance.name = validated_data['name']
        instance.description = validated_data['description']
        instance.save()
        self._update_project_dependents(instance, validated_data)
        return instance


class ProjectDataSeralizer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ('name', 'description')


class ProjectCohortDataSerializer(serializers.ModelSerializer):
    cohort = CohortSerializer()
    project = ProjectSeralizer()
    patient_stats = serializers.SerializerMethodField()

    def get_patient_stats(self, instance):
        request = self.context['request']
        user = request.user
        logger.info('fetching the patients in cohort_id: %d, project_id: %d', instance.cohort_id, instance.project_id)
        project_cohort_patients = ProjectCohortPatient.objects.filter(
            cohort_id=instance.cohort_id,
            project_id=instance.project_id)
        in_progress_patients = project_cohort_patients.filter(
            curation_status=ProjectCohortPatient.CurationStatus.inprogress).count()
        completed_patients = project_cohort_patients.filter(
            curation_status=ProjectCohortPatient.CurationStatus.completed).count()
        pending_patients = project_cohort_patients.filter(
            curation_status=ProjectCohortPatient.CurationStatus.pending).count()

        patient_stats = {
            'total': project_cohort_patients.count(),
            'pending': pending_patients,
            'in_progress': in_progress_patients,
            'completed': completed_patients
        }

        if isUserHasRole(user, 'curator'):
            can_curate_patients = False
            if pending_patients > 0:
                can_curate_patients = True
            else:
                logger.info('getting patients assigned to curator: %s', user.email)
                inprogress_patients = project_cohort_patients.filter(
                    curator_id=user.id,
                    curation_status=ProjectCohortPatient.CurationStatus.inprogress
                ).count()
                can_curate_patients = inprogress_patients > 0

            patient_stats['has_pending_patients'] = can_curate_patients

        return patient_stats

    class Meta:
        model = ProjectCohort
        fields = ('cohort', 'project', 'patient_stats')
