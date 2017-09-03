from rest_framework import serializers
from ..models import Appointment, Procedure

from .procedure import ProcedureSerializer

class AppointmentSerializer(serializers.ModelSerializer):
    procedures_scheduled = ProcedureSerializer(many=True)

    class Meta:
        model = Appointment
        fields = (
            'id',
            'data_source_id',
            'provider_id',
            'facility_id',
            'start',
            'procedures_scheduled',
            'patient',
            'updated_by'
        )

    def create_procedures(self, appointment, procedures):
        """
        create procedure records for appointment
        """
        for procedure in procedures:
            procedure['created_by'] = appointment.created_by
            procedure['appointment'] = appointment.id
        serializer = ProcedureSerializer(data=procedures, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

    def create(self, validated_data):
        """
        Create appointment for the patient
        """
        procedures_scheduled = validated_data.pop('procedures_scheduled')
        appointment = Appointment.objects.create(**validated_data)
        self.create_procedures(appointment, procedures_scheduled)
        return appointment

    def update_procedures(self, appointment, procedures):
        """
        Update procedures data for appointment
        """
        prepare_procedures = []
        for procedure in procedures:
            try:
                procedure_id = int(procedure.get('id', 'None'))
                instance = Procedure.objects.get(
                    appointment_id=appointment.id,
                    id=procedure_id)
                procedure['updated_by'] = appointment.updated_by
                serializer = ProcedureSerializer(instance, data=procedure)
                serializer.is_valid(raise_exception=True)
                serializer.save()
            except (Procedure.DoesNotExist, ValueError):
                prepare_procedures.append(procedure)
        if prepare_procedures:
            self.create_procedures(appointment, prepare_procedures)

    def update_appointment(self, instance, validated_data):
        instance.start = validated_data['start']
        instance.updated_by = validated_data['updated_by']
        instance.provider_id = validated_data['provider_id']
        instance.facility_id = validated_data['facility_id']
        instance.data_source_id = validated_data['data_source_id']
        instance.save()
        return instance

    def update(self, instance, validated_data):
        procedures = self.initial_data['procedures_scheduled']
        instance = self.update_appointment(instance, validated_data)
        self.update_procedures(instance, procedures)
        return instance
