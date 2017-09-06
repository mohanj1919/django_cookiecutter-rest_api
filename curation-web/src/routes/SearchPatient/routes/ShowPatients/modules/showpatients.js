import {
  HIDE_BANNER,
  TOGGLE_NOTIFICATION,
  TOGGLE_LOADING
} from '../../../../../modules/global.js';
import config from '../../../../../config';
import Papa from 'papaparse'
import {
  browserHistory
} from 'react-router'
import axios from '../../../../../lib/axios'
import _ from 'lodash'

const SET_PROP = 'SET_PROP';

var handleEvent = (e) => {
  return (dispatch, getState) => {}
}

var PageChange = (page, sizePerPage) => {
  return (dispatch, getState) => {
    let searchParams = getState().showpatients.searchParams || {};
    searchParams.page = page;
    searchParams.page_size = sizePerPage;
    dispatch({
      type: SET_PROP,
      payload: {
        key: 'searchParams',
        value: searchParams
      }
    })
    
    dispatch(_filterPatients(searchParams))
  }
}

var GetPatients = (search) => {
  return (dispatch, getState) => {
    let params = {
      searchParam: search,
      status: getState().showpatients.searchParams.status
    }
    axios.get(config.api.get_patient_ids, {
      params: { ...params
      }
    }).then(function (response) {
      if (response.status == config.HTTP_Status.success) {
        dispatch({
          type: SET_PROP,
          payload: {
            key: 'availablePatients',
            value: response.data
          }
        })
      }
    })
  }
}

var FetchCohorts = (cohortId) => {
  return (dispatch, getState) => {
    axios.get(config.api.cohort).then(function (response) {
      if (response.status == config.HTTP_Status.success) {
        dispatch({
          type: SET_PROP,
          payload: {
            key: 'availableCohorts',
            value: response.data
          }
        })
      }
    })
  }
}



export function GetCohorts(search) {
  return (dispatch) => {
    let getUrl = search ? `/clinical/domains/?page=1&page_size=10&searchParam=${search}` :
      `/clinical/domains/?page=1&page_size=10`
    _getData(getUrl).then((response) => {
      dispatch({
        type: SET_PROP,
        payload: {
          key: 'availableCohorts',
          value: response.data.results
        }
      })
    })
  }
}

export function GetProjects(search) {
  return (dispatch) => {
    let getUrl = search ? `/clinical/projects/?page=1&page_size=10&searchParam=${search}` :
      `/clinical/projects/?page=1&page_size=10`
    _getData(getUrl).then((response) => {
      dispatch({
        type: SET_PROP,
        payload: {
          key: 'availableProjects',
          value: response.data.results
        }
      })
    })
  }
}


var _getData = function (url) {
  return new Promise((resolve, reject) => {
    axios.get(url)
      .then(function (response) {
        return resolve(response)
      }).catch(function (err) {
        return resolve(err)
      })
  })
}

var SortChange = (sortName, sortOrder) => {
  return (dispatch, getState) => {
    dispatch({
      type: SET_PROP,
      payload: {
        key: 'sortName',
        value: sortName
      }
    });
    dispatch({
      type: SET_PROP,
      payload: {
        key: 'sortOrder',
        value: sortOrder
      }
    });
    return dispatch(PageChange(getState().showpatients.pageNumber, getState().showpatients.pageSize));
  }
}

var FetchPatientData = () => {
  return (dispatch, getState) => {
    //Add service call to fetch patient details
    dispatch({
      type: TOGGLE_LOADING,
      payload: true
    })
    dispatch(_filterPatients(null))
  }
}

var Unassign = (row) =>{
  return (dispatch, getState) => {
    dispatch({
      type: TOGGLE_NOTIFICATION,
      payload: true,
      showTime: null,
      showType: 'warning',
      showMessage: `Are you sure want to unassign patient from curator?`,
      messageTitle: 'UnAssign Patient',
      successCb: function () {
        dispatch({
          type: HIDE_BANNER
        })
        axios.post(config.api.unassign_patient, {
          "patient_id": row.patient_id,
          "curator_id": row.curator_id,
          "project_id": row.project_id
          }).then(function(response){            
            dispatch(_filterPatients(getState().showpatients.searchParams))
            
            dispatch({
              type: TOGGLE_NOTIFICATION,
              showBanner: true,
              showTime: 3000,
              showType: 'success',
              showMessage: 'Successfully unassigned patient'
          })
        }).catch(function(err){
           dispatch({
              type: TOGGLE_NOTIFICATION,
              showBanner: true,
              showTime: 3000,
              showType: 'error',
              showMessage: 'Failed unassigning patient'
            })
        })
      }
    })
  }
}

var ChangeStatus = (status) => {
  return (dispatch, getState) => {
    dispatch({
      type: TOGGLE_LOADING,
      payload: true
    })
    let searchParams = getState().showpatients.searchParams || {};
    if (!_.isEmpty(status)) {
      searchParams.status = status;
      dispatch({
        type: SET_PROP,
        payload: {
          key: 'searchParams',
          value: searchParams
        }
      });
      dispatch(_filterPatients(searchParams))
    }
  }
}

var _filterPatients = (params) => {
  return (dispatch, getState) => {
    axios.get(config.api.get_chart_review_patients, {
      params: { ...params
      }
    }).then(function (response) {
      let patients = []
      _.map(response.data.results, function (item) {
        patients.push({
          cohort_name: item.cohort.name,
          patient_id: item.patient_id,
          project_name: item.project.name,
          curator_email: item.curator.email,
          project_id: item.project.id,
          cohort_id: item.cohort.id,
          curator_id: item.curator.id
        })
      })
      dispatch({
        type: SET_PROP,
        payload: {
          key: 'patients',
          value: patients
        }
      })

      dispatch({
        type: SET_PROP,
        payload: {
          key: 'totalCount',
          value: response.data.count
        }
      })

    }).catch(function (err) {}).then(function () {
      dispatch({
        type: TOGGLE_LOADING,
        payload: false
      })
    })
  };
}

var FilterPatients = (e) => {
  return (dispatch, getState) => {    
    let searchParams = getState().showpatients.searchParams || {};
    if (e) {
      searchParams[e.type] = e.type != 'patient_id' ? (e[0] ? e[0].name : null) : e[0];
      dispatch({
        type: SET_PROP,
        payload: {
          key: 'searchParams',
          value: searchParams
        }
      })
    }
    dispatch(_filterPatients(searchParams))
  }
}

var ExtractCRFs = (patientData, type) => {
  return (dispatch) => {
    let params = {
      project_id: patientData.project_id,
      cohort_id: patientData.cohort_id,
      patient_id: patientData.patient_id
    }
    dispatch({
      type: TOGGLE_LOADING,
      payload: true
    })
    axios.get('/clinical/chartreview/get_chart_review_response', {
      params: { ...params
      }
    }).then(function (response) {
      let data = {
        project_name: response.data.project.name,
        curator_email: response.data.curator.email,
        patient_id: response.data.patient.patient_id,
      }

      if (type == 'csv') {
        let questions = [];
        _.map(response.data.crf_templates, (item) => {
          _.map(item.questions, (question) => {
            data.crf_template_name = item.name;
            Object.assign(question, data);
          })
          questions.push.apply(questions, item.questions)
        })

        downloadFile(Papa.unparse(questions, {
          delimiter: '	'
        }), `${data.project_name}_${params.patient_id}_excel.csv`);
      } else {
        data.crf_templates = response.data.crf_templates;
        downloadFile(JSON.stringify(data), `${data.project_name}_${params.patient_id}_object.json`);
      }

    })
    dispatch({
      type: TOGGLE_LOADING,
      payload: false
    })
  }
}


var downloadFile = function (textToSave, fileName) {
  var hiddenElement = document.createElement('a');
  hiddenElement.href = 'data:attachment/text,' + encodeURI(textToSave);
  hiddenElement.target = '_blank';
  hiddenElement.download = fileName;
  hiddenElement.click();
}

var ShowPatientDetails = (row) => {
  return (dispatch, getState) => {
    browserHistory.push(`/chartreview/${row.project_id}/${row.cohort_id}/${row.patient_id}/${row.curator_id}`)
  }
}

const ACTION_HANDLERS = {
  [SET_PROP]: (state, action) => {
    return Object.assign({}, state, {
      [action.payload.key]: action.payload.value
    })
  }
}

const initialState = {
  pageNumber: 1,
  searchParams: {}
}

export default function showPatientsReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ?
    handler(state, action) :
    state
}

export function dispatchToProps() {
  return {
    PageChange,
    handleEvent,
    SortChange,
    FetchPatientData,
    FetchCohorts,
    GetCohorts,
    GetProjects,
    ShowPatientDetails,
    ExtractCRFs,
    FilterPatients,
    GetPatients,
    ChangeStatus,
    Unassign
  }
}
