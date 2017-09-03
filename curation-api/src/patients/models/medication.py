import logging
from django.db import models
from django.conf import settings

from ...utilities.base_model import BaseModel
from .encounter import Encounter

# Get an instance of a logger
logger = logging.getLogger(__name__)

class Medication(BaseModel):
    class Meta:
        # https://docs.djangoproject.com/en/1.10/ref/models/options/#db-table
        db_table = 'curation_medication'

    id = models.AutoField(primary_key=True)
    patient_encounter = models.ForeignKey(Encounter, on_delete=models.CASCADE, related_name='medications', null=True)
    encounter_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, db_index=True, null=True,)
    medication_record_type = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    administering_provider_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    action = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    code = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    daw_flag = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    days_supply = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    days_supply_derived = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    dispense_as_written = models.NullBooleanField(null=True)
    discontinued = models.NullBooleanField(null=True)
    dispense_quantity = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    doses_per_day = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    end = models.DateTimeField(null=True,)
    expire = models.DateTimeField(null=True,)
    form = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    frequency = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    gpi = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    infusion_dose = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    infusion = models.NullBooleanField(null=True)
    documenting_provider_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    documenting_prov_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    doses_per_day_derived = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    expire_dttm = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    infusion_end_dttm = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    infusion_expiry_1_dttm = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    infusion_expiry_2_dttm = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    infusion_expiry_3_dttm = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    infusion_expiry_4_dttm = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    infusion_flag = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    infusion_patient_weight = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    infusion_patient_weight_unit = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    infusion_planned_dose = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    infusion_planned_dose_unit = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    infusion_rate = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    infusion_rate_unit = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    infusion_reason_for_adjustment = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    infusion_start_dttm = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    infusion_therapy_type = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    infusion_volume_infused = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    infusion_volume_infused_unit = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    name = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    ndc = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    or_dispense = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    pharmacy_fill_number = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    pharmacy_prescription_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    prescribing_provider_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    prescription_fill_number = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    reason_for_discontinuation = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    reason_for_start = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    refills_authorized = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    refills_authorized_numeric = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    route_of_admin = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    rxnorm = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    sig = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    start_dttm = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    status = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    strength = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    total_dose = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    type = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    unit = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)

    def getMedicationRecordForEncounter(self, encounterid):
        query = '''SELECT * FROM {} WHERE encounter_id = '{}' '''.format('curation_medication', encounterid)
        logger.info('query: {}'.format(query))
        return Medication.objects.raw(query)
