import logging

from django.conf import settings
from django.db import models

from ...utilities.base_model import BaseModel
from .encounter import Encounter

# Get an instance of a logger
logger = logging.getLogger(__name__)


class Note(BaseModel):
    class Meta:
		# https://docs.djangoproject.com/en/1.10/ref/models/options/#db-table
        db_table = 'curation_note'

    id = models.AutoField(primary_key=True)
    encounter_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, db_index=True, null=True,)
    name = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    documenting_provider_id = models.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, null=True,)
    text = models.TextField()

    patient_encounter = models.ForeignKey(Encounter, on_delete=models.CASCADE, related_name='notes', null=True)

    def getNoteForEncounter(self, encounterid):
        query = '''SELECT * FROM {} WHERE encounter_id = '{}' '''.format('curation_note', encounterid)
        logger.info('query: {}'.format(query))
        return Note.objects.raw(query)
