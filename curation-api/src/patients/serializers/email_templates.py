from rest_framework import serializers
from django.conf import settings

from ..models import EmailTemplate

class EmailTempaltesSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    name = serializers.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, required=False)
    display_name = serializers.CharField(max_length=settings.STRING_MAX_DEFAULT_LENGTH, required=False)
    subject = serializers.CharField(required=True, max_length=None)
    template = serializers.CharField(required=True, max_length=None)
    place_holders = serializers.CharField(required=False, max_length=None)
    
    class Meta:
        fields = ('id', 'name', 'display_name', 'subject', 'template', 'place_holders',)

    def create(self, validated_data):
        """
        Create email tempate details.
        """
        email_template = EmailTemplate.objects.create(**validated_data)
        email_template.save()
        return email_template


    def update(self, instance, validated_data):
        """
        updates email tempate details.
        """
        # pick slected columns
        instance.template = validated_data.get('template')
        instance.subject = validated_data.get('subject')
        instance.save()

        return instance
