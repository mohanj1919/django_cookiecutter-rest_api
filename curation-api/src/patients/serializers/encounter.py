import logging

from django.conf import settings
from rest_framework import serializers
from django.shortcuts import get_list_or_404, get_object_or_404


from ..models import (
    Encounter,
    Diagnosis,
    JointExam,
    Medication,
    Note,
    Observation,
    Questionnaire,
    Result,
    Procedure,
    Provider
)
from . import (
    DiagnosisSerializer,
    DiagnosisRetrieveSerializer,
    JointExamSerializer,
    JointExamRetrieveSerializer,
    MedicationRecordSerializer,
    MedicationRecordRetrieveSerializer,
    NoteSerializer,
    NoteRetrieveSerializer,
    ProcedureSerializer,
    ProcedureRetrieveSerializer,
    ObservationSerializer,
    ObservationRetrieveSerializer,
    QuestionnaireSerializer,
    QuestionnaireRetrieveSerializer,
    ResultSerializer,
    ResultRetrieveSerializer,
    ProviderSerializer,
    ProcedureRetrieveSerializer)

# Get an instance of a logger
logger = logging.getLogger(__name__)


class EncounterSerializer(serializers.ModelSerializer):
    diagnoses = DiagnosisSerializer(many=True)
    joint_exams = JointExamSerializer(many=True)
    medications = MedicationRecordSerializer(many=True)
    notes = NoteSerializer(many=True)
    procedures = ProcedureSerializer(many=True)
    observations = ObservationSerializer(many=True)
    questionnaires = QuestionnaireSerializer(many=True)
    results = ResultSerializer(many=True)
    cohort_id = serializers.IntegerField(required=False)
    patient_id = serializers.IntegerField(required=False)

    class Meta:
        model = Encounter
        fields = (
            'id', 'data_source_id', 'start', 'end', 'admitting_provider_id',
            'rendering_provider_id', 'facility_id', 'type', 'discharge_disposition',
            'place_of_service', 'type_of_bill', 'diagnoses', 'joint_exams',
            'medications', 'notes', 'procedures', 'observations', 'questionnaires',
            'results', 'cohort_id', 'patient_id',  'encounter_id', 'updated_by',
            'created_by'
        )

    def update_data(self, data, serializer, model, encounter):
        """
        Update encounters data for patient, if present, else create
        """
        prepare_model_records = []

        for datum in data:
            datum['updated_by'] = encounter.updated_by
            try:
                model_id = int(datum.get('id'))
                instance = model.objects.get(id=model_id)
                serializer_instance = serializer(instance, data=datum)
                serializer_instance.is_valid(raise_exception=True)
                serializer_instance.save()
            except (model.DoesNotExist, ValueError, TypeError):
                prepare_model_records.append(datum)
        if prepare_model_records:
            self.create_data(prepare_model_records, serializer, encounter)


    def create_data(self, data, serializer, patient_encounter):
        for datum in data:
            datum['encounter_id'] = patient_encounter.encounter_id
            datum['patient_encounter'] = patient_encounter.id
            datum['created_by'] = patient_encounter.created_by
        serializer = serializer(data=data, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

    def create(self, validated_data):
        diagnoses = validated_data.pop('diagnoses')
        joint_exams = validated_data.pop('joint_exams')
        medications = validated_data.pop('medications')
        notes = validated_data.pop('notes')
        procedures = validated_data.pop('procedures')
        observations = validated_data.pop('observations')
        questionnaires = validated_data.pop('questionnaires')
        results = validated_data.pop('results')
        encounter = Encounter.objects.create(**validated_data)
        encounter_id = encounter.encounter_id
        encounter.save()

        logger.debug('Creating diagnosis records for encounter %s', encounter_id)
        self.create_data(diagnoses, DiagnosisSerializer, encounter)
        logger.debug('Creating joint exam records for encounter %s', encounter_id)
        self.create_data(joint_exams, JointExamSerializer, encounter)
        logger.debug('Creating medication records for encounter %s', encounter_id)
        self.create_data(medications, MedicationRecordSerializer, encounter)
        logger.debug('Creating note records for encounter %s', encounter_id)
        self.create_data(notes, NoteSerializer, encounter)
        logger.debug('Creating procedures records for encounter %s', encounter_id)
        self.create_data(procedures, ProcedureSerializer, encounter)
        logger.debug('Creating questionnaire records for encounter %s', encounter_id)
        self.create_data(questionnaires, QuestionnaireSerializer, encounter)
        logger.debug('Creating observation records for encounter %s', encounter_id)
        self.create_data(observations, ObservationSerializer, encounter)
        logger.debug('Creating result records for encounter %s', encounter_id)
        self.create_data(results, ResultSerializer, encounter)
        return encounter

    def update_encounter(self, instance, validated_data):
        instance.type = validated_data['type']
        instance.start = validated_data['start']
        instance.end = validated_data['end']
        instance.updated_by = validated_data['updated_by']
        instance.facility_id = validated_data['facility_id']
        instance.type_of_bill = validated_data['type_of_bill']
        instance.data_source_id = validated_data['data_source_id']
        instance.place_of_service = validated_data['place_of_service']
        instance.admitting_provider_id = validated_data['admitting_provider_id']
        instance.rendering_provider_id = validated_data['rendering_provider_id']
        instance.discharge_disposition = validated_data['discharge_disposition']
        instance.save()
        return instance

    def update(self, instance, validated_data):
        request_data = self.initial_data
        diagnoses = request_data.pop('diagnoses')
        joint_exams = request_data.pop('joint_exams')
        medications = request_data.pop('medications')
        notes = request_data.pop('notes')
        procedures = request_data.pop('procedures')
        observations = request_data.pop('observations')
        questionnaires = request_data.pop('questionnaires')
        results = request_data.pop('results')
        updated_by = validated_data.get('updated_by')
        instance = self.update_encounter(instance, validated_data)
        encounter_id = instance.encounter_id
        logger.debug('Updating diagnosis records for encounter %s', encounter_id)
        self.update_data(diagnoses, DiagnosisSerializer, Diagnosis, instance)
        logger.debug('Updating joint exam records for encounter %s', encounter_id)
        self.update_data(joint_exams, JointExamSerializer, JointExam, instance)
        logger.debug('Updating medication records for encounter %s', encounter_id)
        self.update_data(medications, MedicationRecordSerializer, Medication, instance)
        logger.debug('Updating note records for encounter %s', encounter_id)
        self.update_data(notes, NoteSerializer, Note, instance)
        logger.debug('Updating procedures records for encounter %s', encounter_id)
        self.update_data(procedures, ProcedureSerializer, Procedure, instance)
        logger.debug('Updating questionnaire records for encounter %s', encounter_id)
        self.update_data(questionnaires, QuestionnaireSerializer, Questionnaire, instance)
        logger.debug('Updating observation records for encounter %s', encounter_id)
        self.update_data(observations, ObservationSerializer, Observation, instance)
        logger.debug('Updating result records for encounter %s', encounter_id)
        self.update_data(results, ResultSerializer, Result, instance)
        return instance


class EncounterRetrieveSerializer(serializers.ModelSerializer):
    diagnoses = serializers.SerializerMethodField()
    joint_exams = serializers.SerializerMethodField()
    medications = serializers.SerializerMethodField()
    notes = serializers.SerializerMethodField()
    procedures = serializers.SerializerMethodField()
    observations = serializers.SerializerMethodField()
    questionnaires = serializers.SerializerMethodField()
    results = serializers.SerializerMethodField()
    providers = serializers.SerializerMethodField()

    class Meta:
        model = Encounter
        fields = (
            'id',
            'patient_id',
            'encounter_id',
            'data_source_id',
            'provider_id',
            'start',
            'end',
            'admitting_provider_id',
            'rendering_provider_id',
            'facility_id',
            'type',
            'discharge_disposition',
            'place_of_service',
            'type_of_bill',
            'diagnoses',
            'joint_exams',
            'medications',
            'notes',
            'procedures',
            'observations',
            'questionnaires',
            'results',
            'providers',
        )

    def get_encounter_data(self, model, serializer, instance):
        objects = model.objects.filter(
            patient_encounter_id=instance.id,
            is_active=True)
        serializer_instance = serializer(objects, many=True)
        return serializer_instance.data

    def get_diagnoses(self, instance):
        return self.get_encounter_data(Diagnosis, DiagnosisRetrieveSerializer, instance)

    def get_joint_exams(self, instance):
        return self.get_encounter_data(JointExam, JointExamRetrieveSerializer, instance)

    def get_medications(self, instance):
        return self.get_encounter_data(Medication, MedicationRecordRetrieveSerializer, instance)

    def get_notes(self, instance):
        return self.get_encounter_data(Note, NoteRetrieveSerializer, instance)

    def get_procedures(self, instance):
        return self.get_encounter_data(Procedure, ProcedureRetrieveSerializer, instance)

    def get_observations(self, instance):
        return self.get_encounter_data(Observation, ObservationRetrieveSerializer, instance)

    def get_questionnaires(self, instance):
        return self.get_encounter_data(Questionnaire, QuestionnaireRetrieveSerializer, instance)

    def get_results(self, instance):
        return self.get_encounter_data(Result, ResultRetrieveSerializer, instance)

    def get_providers(self, instance):
        try:
            provider = Provider.objects.get(
                provider_id=instance.provider_id,
                cohort_id=instance.cohort_id,
                is_active=True)
            return [ProcedureRetrieveSerializer(provider).data]
        except Provider.DoesNotExist:
            return []        
