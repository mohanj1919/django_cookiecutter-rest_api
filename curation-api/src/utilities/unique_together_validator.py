from django.utils.translation import ugettext as _
from rest_framework.exceptions import ValidationError
from django.db import DataError

def qs_exists(queryset):
    try:
        return queryset.exists()
    except (TypeError, ValueError, DataError):
        return False

def qs_filter(queryset, **kwargs):
    try:
        return queryset.filter(**kwargs)
    except (TypeError, ValueError, DataError):
        return queryset.none()

class UniqueTogetherValidator(object):
    """
    Validator that corresponds to `unique_together = (...)` on a model class.

    Should be applied to the serializer class, not to an individual field.
    """
    # message = _('The fields {field_names} must make a unique set.')
    message = _('Values {checked_values} for {field_names} alrady exists.')
    missing_message = _('This field is required.')

    def __init__(self, queryset, fields, message=None):
        self.queryset = queryset
        self.fields = fields
        self.serializer_field = None
        self.message = message or self.message

    def set_context(self, serializer):
        """
        This hook is called by the serializer instance,
        prior to the validation call being made.
        """
        # Determine the existing instance, if this is an update operation.
        self.instance = getattr(serializer, 'instance', None)

    def enforce_required_fields(self, attrs):
        """
        The `UniqueTogetherValidator` always forces an implied 'required'
        state on the fields it applies to.
        """
        if self.instance is not None:
            return

        missing_items = {
            field_name: self.missing_message
            for field_name in self.fields
            if field_name not in attrs
        }
        if missing_items:
            raise ValidationError(missing_items, code='required')

    def filter_queryset(self, attrs, queryset):
        """
        Filter the queryset to all instances matching the given attributes.
        """
        # If this is an update, then any unprovided field should
        # have it's value set based on the existing instance attribute.
        if self.instance is not None:
            for field_name in self.fields:
                if field_name not in attrs:
                    attrs[field_name] = getattr(self.instance, field_name)

        # Determine the filter keyword arguments and filter the queryset.
        filter_kwargs = {
            field_name: attrs[field_name]
            for field_name in self.fields
        }
        return qs_filter(queryset, **filter_kwargs)

    def exclude_current_instance(self, attrs, queryset):
        """
        If an instance is being updated, then do not include
        that instance itself as a uniqueness conflict.
        """
        if self.instance is not None:
            return queryset.exclude(pk=self.instance.pk)
        return queryset

    def __call__(self, attrs):
        self.enforce_required_fields(attrs)
        queryset = self.queryset
        queryset = self.filter_queryset(attrs, queryset)
        queryset = self.exclude_current_instance(attrs, queryset)
        # Ignore validation if any field is None
        checked_values = [
            value for field, value in attrs.items() if field in self.fields
        ]
        if None not in checked_values and qs_exists(queryset):
            field_names = ', '.join(self.fields)
            # field_names=field_names,
            message = self.message.format(checked_values=checked_values, field_names=field_names)
            raise ValidationError(message, code='unique')
