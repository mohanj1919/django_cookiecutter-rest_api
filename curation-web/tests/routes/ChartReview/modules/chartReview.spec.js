import {
    FETCH_PATIENTS_ID,
    default as chartReviewReducer
} from '../../../../src/routes/ChartReview/modules/chartReview'
import expect from 'expect'

describe('(Redux Module) Chart Review', () => {
     beforeEach(function () {
        localStorage.logged_user_role = 'admin'
    });
    const initialState = {
        patientData: {},
        totalPatients: 0,
        patientIDList: [],
        patientSerialNo:0
    }

})