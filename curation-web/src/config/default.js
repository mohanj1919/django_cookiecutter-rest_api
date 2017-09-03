export default {
  api: {
    url: process.env.URL,
    host: process.env.HOST,
    login: '/auth/login/',
    verify_mfa_token: '/auth/verify_mfa_token/',
    forgot_password: '/auth/forgot_password/',
    reset_password: '/users/reset_password/',
    get_roles: '/users/get_roles/',
    get_mfa_type: '/users/get_mfatype/',
    get_users: '/users/',
    get_crf_templates: '/clinical/crftemplates/',
    user_logout: '/users/logout/',
    cohort: '/clinical/domains/',
    projects: '/clinical/projects/',
    get_curators: '/users/get_curators/',
    get_chart_review_patients: '/clinical/chartreview/get_completed_chart_reviews/',
    get_admin_settings: '/clinical/adminsettings/',
    get_crf_questions: '/clinical/crfquestions/'
  },
  HTTP_Status: {
    success: '200',
    UNAUTHORIZE: '401',
    CREATE_SUCCESS: '201',
    DELETE_SUCCESS: '204'
  },
  PATIENT_STATUS:{
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    INPROGRESS: 'INPROGRESS'
  }
};
