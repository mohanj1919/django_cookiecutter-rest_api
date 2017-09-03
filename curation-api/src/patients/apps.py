from django.apps import AppConfig


class PatientsConfig(AppConfig):
    name = 'src.patients'
    verbose_name = "Patients"

    def ready(self):
        """Override this to put in:
            Users system checks
            Users signal registration
        """
        pass
