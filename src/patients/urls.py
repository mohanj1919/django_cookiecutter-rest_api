from django.conf.urls import include, url
from rest_framework.urlpatterns import format_suffix_patterns

from ..utilities.router import get_router
from .views import (CohortView,
                    DiagnosisView,
                    EncounterView,
                    InsuranceView,
                    JointExamView,
                    MedicationRecordView,
                    NoteView,
                    ObservationView,
                    PatientView,
                    ProcedureView,
                    ProviderView,
                    QuestionnaireView,
                    ResultView,
                    CRFTemplateView,
                    ProjectView,
                    CRFQuestionView,
                    PatientChartReviewView,
                    AdminSettingsView,
                    ProjectCohortView)

router = get_router()
router.register(r'clinical/cohorts', CohortView, 'cohorts')
router.register(r'clinical/diagnosis', DiagnosisView, 'diagnosis')
router.register(r'clinical/encounters', EncounterView, 'encounters')
router.register(r'clinical/insurance', InsuranceView, 'insurance')
router.register(r'clinical/joint_exam', JointExamView, 'jointexam')
router.register(r'clinical/medication_records', MedicationRecordView, 'medicationrecord')
router.register(r'clinical/notes', NoteView, 'note')
router.register(r'clinical/observations', ObservationView, 'observation')
router.register(r'clinical/patients', PatientView, 'patients')
router.register(r'clinical/procedures', ProcedureView, 'procedure')
router.register(r'clinical/providers', ProviderView, 'provider')
router.register(r'clinical/questionnaire', QuestionnaireView, 'questionnaire')
router.register(r'clinical/results', ResultView, 'result')
router.register(r'clinical/crftemplates', CRFTemplateView, 'crftemplates')
router.register(r'clinical/projects', ProjectView, 'projects')
router.register(r'clinical/crfquestions', CRFQuestionView, 'crfquestions')
router.register(r'clinical/chartreview', PatientChartReviewView, 'chartreview')
router.register(r'clinical/adminsettings', AdminSettingsView, 'adminsettings')
router.register(r'clinical/projectcohorts', ProjectCohortView, 'projectcohorts')


urlpatterns = [
    url(r'^', include(router.urls))
]

# urlpatterns = urlpatterns + format_suffix_patterns([
# ])
