import logging

from rest_framework import serializers
from ..models import ProjectCohortPatient

# Get an instance of a logger
logger = logging.getLogger(__name__)


class ProjectCohortPatientsListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectCohortPatient
        fields = ('project', 'cohort')
