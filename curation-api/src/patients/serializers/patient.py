from rest_framework import serializers

from ...utilities.unique_together_validator import UniqueTogetherValidator
from ..models import (
    Diagnosis,
    Encounter,
    Insurance,
    JointExam,
    Medication,
    Note,
    Observation,
    Patient,
    Procedure,
    Provider,
    Questionnaire,
    Result,
    Cohort
)
from ..models.patient_demographic import PatientDemographic
from ..serializers.encounter import EncounterSerializer, EncounterRetrieveSerializer

class PatientDemographicSerializer(serializers.ModelSerializer):
    patient_id = serializers.CharField(required=False)
    curation_patient_id = serializers.CharField(required=False)

    class Meta:
        model = PatientDemographic
        fields = ('id', 'recorded', 'sex', 'patient_id', 'curation_patient_id', 'updated_by', 'created_by')

class PatientDemographicRetrieveSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientDemographic
        exclude = ('updated_by', 'created_by', 'created_on', 'updated_on',)

class IsPatientExists(object):
    def __call__(self, patient_id):
        try:
            obj = Patient.objects.get(patient_id=patient_id)
        except Patient.DoesNotExist:
            raise serializers.ValidationError('Patient details not found.')


class PatientSerializer(serializers.ModelSerializer):
    encounters = EncounterSerializer(many=True)
    demographics = PatientDemographicSerializer(many=True, required=False)
    cohort = serializers.PrimaryKeyRelatedField(queryset=Cohort.objects.all(), required=True)

    class Meta:
        model = Patient
        fields = (
            'id',
            'patient_id',
            'deceased',
            'race',
            'sex_at_birth',
            'date_of_birth',
            'dob_is_year',
            'cohort',
            'encounters',
            'demographics',
            'updated_by',
            'created_by')
        validators = [
            UniqueTogetherValidator(
                queryset=Patient.objects.all(),
                fields=('cohort', 'patient_id',),
                message=('patient details already exists in domain')
            )
        ]

    def create_demographics(self, patient, demographics):
        """
        Create demographic data for patient
        """
        for demographic in demographics:
            demographic['patient_id'] = patient.patient_id
            demographic['curation_patient_id'] = patient.id
            demographic['created_by'] = patient.created_by

        serializer = PatientDemographicSerializer(data=demographics, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

    def create_encounters(self, encounters, patient):
        for encounter in encounters:
            encounter_id = encounter.get('encounter_id')
            encounter['encounter_id'] = encounter.get('id', encounter_id)
            encounter['cohort_id'] = patient.cohort_id
            encounter['patient_id'] = patient.id
            encounter['created_by'] = patient.created_by
        encounter_serilizer = EncounterSerializer(data=encounters, many=True)
        encounter_serilizer.is_valid(raise_exception=True)
        encounter_serilizer.save()

    def update_encounters(self, patient, encounters):
        """
        Update encounters data for patient
        """
        prepare_encounters = []
        for encounter in encounters:
            try:
                encounter_id = int(encounter['id'])
                encounter_instance = Encounter.objects.get(
                    cohort_id=patient.cohort_id,
                    patient_id=patient.id,
                    id=encounter_id)
                encounter['updated_by'] = patient.updated_by
                serializer = EncounterSerializer(encounter_instance, data=encounter)
                serializer.is_valid(raise_exception=True)
                serializer.save()
            except (Encounter.DoesNotExist, ValueError):
                prepare_encounters.append(encounter)
        if prepare_encounters:
            self.create_encounters(prepare_encounters, patient)

    def update_demographics(self, patient, demographics):
        """
        Update demographic data for patient
        """
        prepare_demographics = []
        for demographic in demographics:
            try:
                demographic_id = int(demographic['id'])
                instance = PatientDemographic.objects.get(
                    curation_patient_id=patient.id,
                    id=demographic_id)
                demographic['updated_by'] = patient.updated_by
                serializer = PatientDataSerializer(instance, data=demographic)
                serializer.is_valid(raise_exception=True)
                serializer.save()
            except (PatientDemographic.DoesNotExist, ValueError):
                prepare_demographics.append(demographic)
        if prepare_demographics:
            self.create_demographics(patient, prepare_demographics)

    def create(self, validated_data):
        encounters = validated_data.pop('encounters')
        demographics = validated_data.pop('demographics')
        patient = Patient.objects.create(**validated_data)
        patient.save()
        self.create_encounters(encounters, patient)
        self.create_demographics(patient, demographics)
        return patient

    def update_patient_data(self, instance, validated_data):
        instance.updated_by = validated_data['updated_by']
        instance.deceased = validated_data['deceased']
        instance.sex_at_birth = validated_data['sex_at_birth']
        instance.date_of_birth = validated_data['date_of_birth']
        instance.dob_is_year = validated_data['dob_is_year']
        instance.save()
        return instance

    def update(self, instance, validated_data):
        encounters = self.initial_data['encounters']
        patient = self.update_patient_data(instance, validated_data)
        self.update_encounters(patient, encounters)
        return patient

    def getPatientEncounters(self, patient_id, cohort_id):
        encounters = Encounter.objects.filter(patient_id=patient_id, cohort_id=cohort_id)
        return EncounterRetrieveSerializer(encounters, many=True).data


class PatientDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = (
            'patient_id',
            'deceased',
            'race',
            'sex_at_birth',
            'date_of_birth',
            'dob_is_year',)

class PatientListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = (
            'id',
            'patient_id',
            'deceased',
            'race',
            'sex_at_birth',
            'date_of_birth',
            'dob_is_year',
            'cohort',)

class PatientRetrieveSerializer(serializers.ModelSerializer):
    encounters = serializers.SerializerMethodField()
    demographics = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = (
            'id',
            'patient_id',
            'deceased',
            'race',
            'sex_at_birth',
            'date_of_birth',
            'dob_is_year',
            'cohort',
            'encounters',
            'demographics',)

    def get_encounters(self, instance):
        encounters = Encounter.objects.filter(
            is_active=True,
            patient_id=instance.id)
        serializer = EncounterRetrieveSerializer(encounters, many=True)
        return serializer.data

    def get_demographics(self, instance):
        demographics = PatientDemographic.objects.filter(
            is_active=True,
            curation_patient_id=instance.id)
        serializer = PatientDemographicRetrieveSerializer(demographics, many=True)
        return serializer.data
