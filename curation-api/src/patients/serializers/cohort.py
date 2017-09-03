from rest_framework import serializers

from ...users.models import CurationUser
from ...users.serializers.userSerializer import IsCuratorExists
from ..models import Cohort, Patient, ProjectCohortPatient


class IsCohortExists(object):
    def __call__(self, cohort_ids):
        curators = Cohort.objects.get_all_chort_details(cohort_ids)
        count = curators.count()
        if count < len(cohort_ids):
            raise serializers.ValidationError('Cohort detials not found.')


class CohortSerializer(serializers.ModelSerializer):

    class Meta:
        model = Cohort
        fields = ('id', 'name', 'description', 'patients',)
        read_only_fields = ('patients',)


class CohortListCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cohort
        fields = ('id', 'name', 'description')


class CohortDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cohort
        fields = ('name', 'description')
