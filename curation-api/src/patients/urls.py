from django.conf.urls import include, url

from ..utilities.router import get_router
from .views import (CohortView,
                    PatientView,
                    CRFTemplateView,
                    ProjectView,
                    CRFQuestionView,
                    PatientChartReviewView,
                    AdminSettingsView,
                    ProjectCohortView,
                    EmailTemplatesView)

from .views.cohort_patient import CohortPatientsListView, CohortPatientsDetailView
from .views.encounter import EncounterListView, EncounterDetailsView
from .views.appointment import AppointmentListView, AppointmentDetailsView
from .views.provider import ProviderListView, ProviderDetailsView

router = get_router()
router.register(r'clinical/domains', CohortView, 'domains')
router.register(r'clinical/patients', PatientView, 'patients')
router.register(r'clinical/crftemplates', CRFTemplateView, 'crftemplates')
router.register(r'clinical/projects', ProjectView, 'projects')
router.register(r'clinical/crfquestions', CRFQuestionView, 'crfquestions')
router.register(r'clinical/chartreview', PatientChartReviewView, 'chartreview')
router.register(r'clinical/adminsettings', AdminSettingsView, 'adminsettings')
router.register(r'clinical/emailtemplates', EmailTemplatesView, 'emailtemplates')
router.register(r'clinical/projectcohorts', ProjectCohortView, 'projectcohorts')

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^clinical/domains/(?P<domain_id>[^/]+)/patients/$', CohortPatientsListView.as_view()),
    url(r'^clinical/domains/(?P<domain_id>[^/]+)/patients/(?P<patient_id>[^/]+)/$', CohortPatientsDetailView.as_view()),
    url(r'^clinical/domains/(?P<domain_id>[^/]+)/patients/(?P<patient_id>[^/]+)/encounters/$',
        EncounterListView.as_view()),
    url(r'^clinical/domains/(?P<domain_id>[^/]+)/patients/(?P<patient_id>[^/]+)/encounters/(?P<encounter_id>[^/]+)/$',
        EncounterDetailsView.as_view()),
    url(r'^clinical/domains/(?P<domain_id>[^/]+)/patients/(?P<patient_id>[^/]+)/appointments/$',
        AppointmentListView.as_view()),
    url(r'^clinical/domains/(?P<domain_id>[^/]+)/patients/(?P<patient_id>[^/]+)/appointments/(?P<appointment_id>[^/]+)/$',
        AppointmentDetailsView.as_view()),
    url(r'^clinical/domains/(?P<domain_id>[^/]+)/providers/$', ProviderListView.as_view()),
    url(r'^clinical/domains/(?P<domain_id>[^/]+)/providers/(?P<provider_id>[^/]+)/$', ProviderDetailsView.as_view()),
]
