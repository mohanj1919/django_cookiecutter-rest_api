import json
from rest_framework import serializers

from ...users.serializers.userSerializer import IsCuratorExists
from ..models import Project, ProjectCohort, CRFTemplate, ProjectCurator, PatientChartReview
from rest_framework.validators import UniqueValidator

from . import (
    IsCohortExists,
    ProjectCohortSerializer,
    ProjectCuratorSerializer,
    ProjectCrfTemplateSerializer,
    IsCrfTemplateExists,
    CohortSerializer
)

from .project_cohort import ProjectCohortListSerializer
# from .patient_chart_review import PatientChartReviewListSerializer

class ProjectListSeralizer(serializers.ModelSerializer):
    cohorts = serializers.SerializerMethodField()

    def get_cohorts(self, project):
        project_cohorts = ProjectCohort.objects.filter(project_id=project.id, is_active=True)
        cohorts = ProjectCohortListSerializer(project_cohorts, many=True)
        cohorts = [cohort_data.get('cohort') for cohort_data in cohorts.data]
        return cohorts

    class Meta:
        model = Project
        fields = ('id', 'name', 'description', 'cohorts') #, 'patient_project')


class ProjectSeralizer(serializers.ModelSerializer):
    # project_cohorts=ProjectCohortSerializer(many=True)
    # project_curators=ProjectCuratorSerializer(many=True)
    # project_crf_templates=ProjectCrfTemplateSerializer(many=True)

    name = serializers.CharField(validators=[
        UniqueValidator(
            queryset=Project.objects.all(),
            message="Project with this name already exists.",
            lookup='iexact'
        )], max_length=100
    )

    class Meta:
        model = Project
        fields = ('id', 'name', 'description') #, 'project_cohorts', 'project_curators', 'project_crf_templates')


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
        cohort_ids = validated_data.get("cohorts", [])
        curator_ids = validated_data.get("curators", [])
        crf_templates = validated_data.get("crf_templates", [])

        # create project_cohorts
        ProjectCohortSerializer.create_lambda(created_project.id, cohort_ids)

        # create project_curators
        ProjectCuratorSerializer.create_lambda(created_project.id, curator_ids)

        # create project_crf_template
        ProjectCrfTemplateSerializer.create_crf_templates(created_project.id, crf_templates)

        return created_project

    def get_all_project_details(self, project):
        project_details = {}
        if project is not None:
            project_details['cohorts'] = project.project_cohorts.filter(is_active=True)
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
            # delete all the template details and insert the updated details
            ProjectCrfTemplateSerializer.delete_crf_templates(project_id, template_ids_in_db)

            # create project_crf_template
            ProjectCrfTemplateSerializer.create_crf_templates(project_id, templates_in_req)

    def _update_project_dependents(self, project, validated_data):
        curators = validated_data.get('curators', [])
        cohorts = validated_data.get('cohorts', [])
        crf_templates = validated_data.get('crf_templates', [])

        project_details = self.get_all_project_details(project)
        project_cohorts = project_details['cohorts']
        project_curators = project_details['curators']
        project_crf_templates = project_details['crf_templates']

        cohorts_in_db = [obj.cohort_id for obj in project_cohorts if project_cohorts is not None]
        curators_in_db = [obj.curator_id for obj in project_curators if project_curators is not None]
        crf_templates_in_db = [obj.crf_template_id for obj in project_crf_templates if project_crf_templates is not None]

        self.upsert_project_dependents(project.id, curators, curators_in_db,
                                       ProjectCuratorSerializer.create_lambda, ProjectCuratorSerializer.in_activate_lambda)
        self.upsert_project_dependents(project.id, cohorts, cohorts_in_db,
                                       ProjectCohortSerializer.create_lambda, ProjectCohortSerializer.update_lambda)
        self.upsert_project_crf_templates(project.id, crf_templates, crf_templates_in_db)

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
    class Meta:
        model = ProjectCohort
        fields = ('cohort', 'project', )

