from rest_framework import serializers

from ..models import ProjectCrfTemplate, CRFTemplate, PatientChartReview
from .crftemplate import CRFTemplateListSerializer

class ProjectCrfTemplateSerializer(serializers.ModelSerializer):
    # related_crf_template = CRFTemplateListSerializer()
    class Meta:
        model = ProjectCrfTemplate
        fields = ('id', 'crf_template_id', 'project_id', 'is_required') #, 'related_crf_template')

    @staticmethod
    def create_crf_templates(project_id, crf_templates):
        """
        Create a record in curation_project_crf_template table for this project
        """
        project_crf_templates = []

        for crf_template in crf_templates:
            # prepare curation_project_crf_template record
            template = ProjectCrfTemplate(
                project_id=project_id,
                crf_template_id=crf_template['id'],
                is_required=crf_template['is_required']
            )
            project_crf_templates.append(template)
        ProjectCrfTemplate.objects.bulk_create(project_crf_templates)
        return project_crf_templates

    @staticmethod
    def delete_crf_templates(project_id, remove_crf_template_ids):
        project_crf_templates = ProjectCrfTemplate.objects.filter(
            project_id=project_id, crf_template_id__in=remove_crf_template_ids)
        project_crf_templates.delete()

    @staticmethod
    def get_project_crf_template_details(project_id):
        """
        Returns the crf template detials in the project_id
        """
        project_crf_templates = ProjectCrfTemplate.objects.filter(project_id=project_id, is_active=True)
        crf_template_ids = [project_crf_template.crf_template_id for project_crf_template in project_crf_templates]
        project_crf_templates = ProjectCrfTemplateSerializer(project_crf_templates, many=True).data
        project_crf_template_details = []
        if len(crf_template_ids) > 0:
            crf_templates = CRFTemplate.objects.get_all_crf_template_details(crf_template_ids)
            crf_template_details = CRFTemplateListSerializer(crf_templates, many=True).data
            for crf_template in crf_template_details:
                el = [x for x in project_crf_templates if x['crf_template_id'] == crf_template['id']][0]
                crf_template['is_required'] = el['is_required']
            project_crf_template_details = crf_template_details

        return project_crf_template_details
