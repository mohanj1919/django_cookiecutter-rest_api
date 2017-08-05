
import json

from rest_framework import serializers

from ..models import (Diagnosis, Encounter, Insurance, JointExam,
                      MedicationRecord, Note, Observation, Patient, Procedure,
                      Provider, Questionnaire, Result)
from ...utilities.unique_together_validator import UniqueTogetherValidator


class IsPatientExists(object):
    def __call__(self, patient_id):
        try:
            obj = Patient.objects.get(patient_id=patient_id)
        except Patient.DoesNotExist:
            raise serializers.ValidationError('Patient details not found.')


class PatientSerializer(serializers.ModelSerializer):
    year_of_death = serializers.CharField(max_length=4, allow_null=True)

    class Meta:
        model = Patient
        fields = ('id', 'patient_id', 'address_state', 'deceased_indicator', 'employment_status', 'ethnicity', 'language',
                  'living_situation_status', 'marital_status', 'pcp_id', 'race', 'sex', 'year_of_birth', 'year_of_death', 'zip_3', 'cohort',)
        validators = [
            UniqueTogetherValidator(
                queryset=Patient.objects.all(),
                fields=('cohort', 'patient_id',),
                message=('patient details already exists in cohort')
            )
        ]

    def _serialize_raw_query_set(self, rawQuerySet):
        from django.core import serializers as jsonSerializer

        res = jsonSerializer.serialize('json', rawQuerySet)
        return [obj['fields'] for obj in json.loads(res)]

    def getPatientEncounters(self, patientId):
        encounters = Encounter().getPatientEncounters(patientId)
        patientEncounters = self._serialize_raw_query_set(encounters)
        for encounter in patientEncounters:
            encounterid = encounter.get('encounter_id', None)

            diagnosis = Diagnosis().getDiagnosisForEncounter(encounterid)
            encounter['diagnosys'] = self._serialize_raw_query_set(diagnosis)

            insurance = Insurance().getInsuranceForEncounter(encounterid)
            encounter['insurance'] = self._serialize_raw_query_set(insurance)

            jointexam = JointExam().getJointExamForEncounter(encounterid)
            encounter['joint_exam'] = self._serialize_raw_query_set(jointexam)

            medicationrecord = MedicationRecord().getMedicationRecordForEncounter(encounterid)
            encounter['medication_record'] = self._serialize_raw_query_set(
                medicationrecord)

            note = Note().getNoteForEncounter(encounterid)
            encounter['note'] = self._serialize_raw_query_set(note)

            observation = Observation().getObservationForEncounter(encounterid)
            encounter['observation'] = self._serialize_raw_query_set(
                observation)

            procedure = Procedure().getProcedureForEncounter(encounterid)
            encounter['procedure'] = self._serialize_raw_query_set(procedure)

            provider = Provider().getProviderForEncounter(encounterid)
            encounter['provider'] = self._serialize_raw_query_set(provider)

            questionnaire = Questionnaire().getQuestionnaireForEncounter(encounterid)
            encounter['questionnaire'] = self._serialize_raw_query_set(
                questionnaire)

            result = Result().getResultForEncounter(encounterid)
            encounter['result'] = self._serialize_raw_query_set(result)

        return patientEncounters


class PatientDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ('patient_id', 'address_state', 'deceased_indicator', 'employment_status',
                  'ethnicity', 'language', 'living_situation_status', 'marital_status', 'pcp_id',
                  'race', 'sex', 'year_of_birth', 'year_of_death', 'zip_3',)
