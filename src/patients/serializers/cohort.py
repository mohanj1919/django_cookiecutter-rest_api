from rest_framework import serializers

from ...users.models import CurationUser
from ...users.serializers.userSerializer import IsCuratorExists
from ..models import Cohort, Patient

class IsCohortExists(object):
    def __call__(self, cohort_ids):
        curators = Cohort.objects.get_all_chort_details(cohort_ids)
        count = curators.count()
        if count < len(cohort_ids):
            raise serializers.ValidationError('Cohort detials not found.')

class CohortSerializer(serializers.ModelSerializer):
    patient_stats = serializers.SerializerMethodField()

    def get_patient_stats(self, cohort):
        cohort_patients = cohort.patients.all()
        in_progress_patients_count = cohort_patients.filter(curation_status=Patient.StatusType.inprogress).count()
        completed_patients_count = cohort_patients.filter(curation_status=Patient.StatusType.completed).count()
        pending_patients_count = cohort_patients.filter(curation_status=Patient.StatusType.pending).count()
        patient_stats = {
            'in_progress': in_progress_patients_count,
            'completed': completed_patients_count,
            'pending': pending_patients_count,
            'total': cohort_patients.count()
        }
        return patient_stats

    class Meta:
        model = Cohort
        fields = ('id', 'name', 'description', 'patients', 'patient_stats',)
        read_only_fields = ('patients', 'patient_stats',)

class CohortListCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cohort
        fields = ('id', 'name', 'description')

class CohortDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cohort
        fields = ('name', 'description')
