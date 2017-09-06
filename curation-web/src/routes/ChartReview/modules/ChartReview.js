import axios from '../../../lib/axios';
import _ from 'lodash';
import { browserHistory } from 'react-router';
import config from '../../../config'
import moment from 'moment';
import {
  HIDE_BANNER,
  TOGGLE_NOTIFICATION,
  TOGGLE_LOADING
} from '../../../modules/global.js';

export const FETCH_PATIENTS_BY_ID = 'FETCH_PATIENTS_BY_ID';
export const FETCH_PATIENTS_ID = 'FETCH_PATIENTS_ID';
export const SET_PROP = 'SET_PROP';
export const TOGGLE_COLLAPSE = 'TOGGLE_COLLAPSE';
export const CLEAR_DATA = 'CLEAR_DATA';
const SET_PATIENT_SECTIONS = 'SET_PATIENT_SECTIONS';
//action creators

export function SetCohortID(projectId, cohortId, patientId = null, curatorId = null) {
  return (dispatch) => {
    dispatch({
      type: SET_PROP,
      payload: {
        key: 'ProjectId',
        value: projectId
      }
    })

    dispatch({
      type: SET_PROP,
      payload: {
        key: 'cohortID',
        value: parseInt(cohortId)
      }
    })
    if (patientId) {
      dispatch({
        type: SET_PROP,
        payload: {
          key: 'isReadOnly',
          value: true
        }
      })
    }
    dispatch({
      type: SET_PROP,
      payload: {
        key: 'curatorId',
        value: curatorId
      }
    })

    dispatch(GetPatientDetailsById(patientId))
  }
}


let tempAnswers = [];

export function handleAnswerEvent(event, id, question_id) {
  return (dispatch, getState) => {
    let answers = _.clone(getState().chartreview.answers)
    let currentTemplateId = getState().chartreview.currentTemplateId;
    let value = !event._isAMomentObject ? event.target.value.toLowerCase() : moment(event).format('L');
    let options = getState().chartreview.annotationsOptions;
    let annotationText = getState().chartreview.annotationText;

    if (!answers[currentTemplateId][_.toString(question_id)]) {
      answers[currentTemplateId][_.toString(question_id)] = [];
    }
    if (event.target && event.target.type == 'checkbox') {
      if (event.target.checked) {
        answers[currentTemplateId][_.toString(question_id)].push(value);
      } else {
        _.remove(answers[currentTemplateId][_.toString(question_id)], function (item) {
          return item == value || _.isEmpty(item)
        });
      }
    } else {
      answers[currentTemplateId][_.toString(question_id)] = [value];
      if (event.target && event.target.type == 'text') {
        answers[currentTemplateId][_.toString(question_id)] = [event.target.value];
      }
    }
    if (event._isAMomentObject) {
      answers[currentTemplateId][_.toString(question_id)] = []
      if (value.toLowerCase() == 'invalid date') {
        value = moment()
      }
      answers[currentTemplateId][_.toString(question_id)].push(value);
    }
    tempAnswers.push({
      crf_template_question_id: id,
      responses: _.isEmpty(answers[currentTemplateId][_.toString(question_id)]) ? '' : _.join(answers[currentTemplateId][_.toString(question_id)], ','),
      annotation_text: _.get(annotationText, question_id, null),
      annotation_responses: options && options[question_id] ? options[question_id].join(',') : null
    })

    let availbleCRFs = _.clone(getState().chartreview.availableCRFS);
    _.map(availbleCRFs.questions, (item) => {
      if (item.id == id) {
        item.response = answers[currentTemplateId][_.toString(question_id)]
        item.validationState = null;
      }
    })
    dispatch({
      type: SET_PROP,
      payload: {
        key: 'availableCRFS',
        value: availbleCRFs
      }
    })
    let childQuestions = _.filter(getState().chartreview.availableCRFS.questions, (item) => {
      return item.parent_question == question_id;
    })
    if (!_.isEmpty(childQuestions)) {
      _.map(childQuestions, (question) => {
        if (_.intersection(question.parent_response.split(','), answers[currentTemplateId][_.toString(question_id)]).length == 0) {
          dispatch(handleAnswerEvent({
            target: {
              value: ''
            }
          }, question.id, question.question_id));
        }
      })
    }

    let request = {
      patient_id: getState().chartreview.patientData.id,
      crf_template_id: currentTemplateId,
      project_id: getState().chartreview.ProjectId,
      cohort_id: getState().chartreview.cohortID,
      curator: getState().global.toJS().emailid,
      question_responses: tempAnswers
    };
    axios.post(config.api.get_chart_review, request)
      .then(function (response) { }).catch(function (err) {
        dispatch({
          type: TOGGLE_NOTIFICATION,
          payload: true,
          showTime: 3000,
          showType: 'error',
          showMessage: 'ERROR SAVING RESPONSE'
        })
      }).then(function () {
        tempAnswers = [];
      })

    dispatch({
      type: SET_PROP,
      payload: {
        key: 'answers',
        value: {
          ...answers
        }
}
    })
  }
}

export function ClearData() {
  return (dispatch, getState) => {
    dispatch({
      type: CLEAR_DATA
    });
  }
}

export function SelectTemplate(e, template) {
  return (dispatch, getState) => {
    dispatch({
      type: SET_PROP,
      payload: {
        key: 'currentTemplateId',
        value: template.id
      }
    });
    dispatch(GetQuestionsByTemplateId(template.id))
  }
}

export function GetAvailableCRFS(projectId) {
  return (dispatch, getState) => {
    try {
      let url = `${config.api.projects}${projectId}/`;
      axios.get(url).then(function (response) {
        let availableCRFS = response.data.project_crf_templates;

        dispatch({
          type: SET_PROP,
          payload: {
            key: 'availableCRFS',
            value: []
          }
        })

        dispatch({
          type: SET_PROP,
          payload: {
            key: 'projectName',
            value: response.data.name
          }
        })

        let answers = {};
        _.map(response.data.project_crf_templates, function (item) {
          answers[item.id] = {}
        })

        dispatch({
          type: SET_PROP,
          payload: {
            key: 'answers',
            value: answers
          }
        })

        let params = {
          project_id: getState().chartreview.ProjectId,
          patient_id: getState().chartreview.patientData.id
        }
        if (!_.isEmpty(getState().chartreview.curatorId)) {
          params.curator_id = getState().chartreview.curatorId;
        }
        axios.get('clinical/chartreview/get_chart_review_status/', {
          params: {
            ...params
          }
        }).then(function (response) {
      _.map(availableCRFS, function (item) {
        let resultItem = _.find(response.data, (res) => {
          return res.crf_template_id == item.id
        });
        if (_.isEmpty(resultItem)) {
          item.status = 'NOTSTARTED';
        } else {
          item.status = resultItem.status
        }
      });

      availableCRFS = _.sortBy(availableCRFS, ['is_required']).reverse()
      let pendingCRFS = _.filter(availableCRFS, (crf) => crf.status.toLowerCase() != 'completed').length;

      dispatch({
        type: SET_PROP,
        payload: {
          key: 'availableCRFNames',
          value: availableCRFS
        }
      })

      dispatch({
        type: SET_PROP,
        payload: {
          key: 'pendingCRFS',
          value: pendingCRFS
        }
      })

      let inProgressCRF = _.find(availableCRFS, (item) => {
        return _.upperCase(item.status) == 'INPROGRESS';
      })
      if (_.isEmpty(inProgressCRF)) {
        inProgressCRF = _.find(availableCRFS, (item) => {
          return _.upperCase(item.status) == 'NOTSTARTED';
        })
      }
      dispatch({
        type: SET_PROP,
        payload: {
          key: 'isCompletedRequired',
          value: _.isEmpty(inProgressCRF) ? false : inProgressCRF.is_required
        }
      })
      if (_.isEmpty(inProgressCRF)) {
        inProgressCRF = availableCRFS[0]
      }
      let completedCrfs = _.filter(availableCRFS, (item) => {
        return item.status.toLowerCase() != 'completed';
      })

      if ((completedCrfs && completedCrfs.length == 1)) {
        dispatch({
          type: SET_PROP,
          payload: {
            key: 'isCompletedRequired',
            value: false
          }
        })
      }
      if (getState().chartreview.availableCRFNames.length == 1 && inProgressCRF.disabled) {
        dispatch({
          type: SET_PROP,
          payload: {
            key: 'isCompletedRequired',
            value: false
          }
        })
      }

      dispatch({
        type: SET_PROP,
        payload: {
          key: 'currentTemplateId',
          value: inProgressCRF ? inProgressCRF.id : null
        }
      })
      if (inProgressCRF) {
        dispatch(GetQuestionsByTemplateId(inProgressCRF.id))
      }
    })
  }).catch(function (err) {
    dispatch({
      type: TOGGLE_NOTIFICATION,
      payload: true,
      showTime: 3000,
      showType: 'error',
      showMessage: 'ERROR FETCHING CRFs'
    })
  })
    } catch (err) {
  //TODO: add error text
}
  }
}

let t = [];

var sortarray = function (arr, questions) {
  _.map(arr, (parent) => {
    parent.parent_response = parent.parent_response ? parent.parent_response.toLowerCase() : '';
    t.push(parent)
    let childQuestions = _.filter(questions, (item) => {
      return item.parent_question == parent.question_id;
    })
    if (!_.isEmpty(childQuestions)) {
      sortarray(childQuestions, questions)
    }
  })
  return t;
}

export function GetQuestionsByTemplateId(templateId) {
  return (dispatch, getState) => {
    let url = `${config.api.get_crf_templates}${templateId}/`;
    dispatch({
      type: TOGGLE_LOADING,
      payload: true
    });
    axios.get(url).then(function (response) {

      let request = {
        patient_id: getState().chartreview.patientData.id,
        project_id: getState().chartreview.ProjectId,
        crf_template_id: getState().chartreview.currentTemplateId
      };

      let template = response.data;
      let params = {
        patient_id: request.patient_id,
        project_id: request.project_id,
        crfTemplate_id: request.crf_template_id
      }
      if (!_.isEmpty(getState().chartreview.curatorId)) {
        params.curator_id = getState().chartreview.curatorId;
      }
      let questionsData = [];
      t = [];
      let parentQuestions = _.filter(template.questions, (item) => {
        return _.isEmpty(item.parent_question)
      })
      template.questions = sortarray(parentQuestions, template.questions);
      axios.get('clinical/chartreview/answers/', {
        params: {
          ...params
        }
      })
        .then(function (response) {

    if (_.isEmpty(response.data)) {
      questionsData = [];
      template.disabled = false;
    } else {
      template.disabled = (response.data.status.toLowerCase() == 'completed');
      questionsData = response.data.questions_data
    }
  }).catch(function (err) {
    dispatch({
      type: TOGGLE_NOTIFICATION,
      payload: true,
      showTime: 3000,
      showType: 'error',
      showMessage: 'ERROR FETCHING ANSWERS'
    })
  }).then(() => {
    let answers = _.clone(getState().chartreview.answers);
    let annotationText = {};
    let annotationsOptions = {};

    _.map(questionsData, (item) => {
      if (!answers[templateId]) {
        answers[templateId] = {}
      }
      let responses = item.responses.replace(/\n/g, " ").split(',');
      if (_.isEmpty(responses)) {
        responses = [];
      }

      answers[templateId][item.question_id] = responses;
      annotationText[item.question_id] = _.isEmpty(item.annotation_text) ? null : item.annotation_text;
      annotationsOptions[item.question_id] = _.isEmpty(item.annotation_responses) ? [] : item.annotation_responses.split(',');
    })

    _.map(template.questions, function (item) {
      if (_.isEmpty(item.responses)) {
        item.responses = '';
      }
      if (_.isEmpty(answers[templateId][item.question_id])) {
        item.response = '';
      } else {
        item.response = answers[templateId][item.question_id]
      }
      item.annotation_text = annotationText[item.question_id];


      item.options = [];
      _.map(getState().chartreview.patientSections, (section) => {
        item.options.push({
          value: section.value,
          selected: (annotationsOptions[item.question_id] && annotationsOptions[item.question_id].indexOf(section.value) != -1)
        })
      });
      item.selectedOptions = annotationsOptions[item.question_id];

      switch (item.question_type) {
        case 'multiple':
          item.question_type = 'checkbox';
          break;

        case 'single':
          item.question_type = 'radio';
          break;

        case 'numeric':
          item.question_type = 'numeric';
          break;

        case 'date':
          item.question_type = 'date';
          break;

        default:
          item.question_type = 'text';
      }
    });

    dispatch({
      type: SET_PROP,
      payload: {
        key: 'availableCRFS',
        value: template
      }
    })
    dispatch({
      type: SET_PROP,
      payload: {
        key: 'answers',
        value: answers
      }
    })
    dispatch({
      type: SET_PROP,
      payload: {
        key: 'annotationText',
        value: annotationText
      }
    })

    dispatch({
      type: SET_PROP,
      payload: {
        key: 'annotationsOptions',
        value: annotationsOptions
      }
    })
  })

}).catch(function (err) {
  dispatch({
    type: TOGGLE_NOTIFICATION,
    payload: true,
    showTime: 3000,
    showType: 'error',
    showMessage: 'ERROR FETCHING QUESTIONS FOR SELECTED TEMPLATE'
  })
}).then(function () {
  dispatch({
    type: TOGGLE_LOADING,
    payload: false
  });
})
  }
}

export function CompleteCuration() {
  return (dispatch, getState) => {
    if (!getState().chartreview.availableCRFS.disabled) {

      dispatch(SubmitTemplate(_completeCuration))
      return;
    }

    dispatch({
      type: TOGGLE_NOTIFICATION,
      payload: true,
      showTime: null,
      showType: 'warning',
      showMessage: `Are you sure you want to complete Curation?`,
      messageTitle: 'Complete Curation',
      successCb: function () {
        dispatch(_completeCuration())
      }
    })
  }
}

function _completeCuration() {
  return (dispatch, getState) => {
    axios.post(config.api.post_complete_curation, {
      patient_id: getState().chartreview.patientData.patient_id,
      project_id: getState().chartreview.ProjectId,
      cohort_id: getState().chartreview.cohortID
    }).then(function (response) {
      dispatch({
        type: SET_PROP,
        payload: {
          key: 'pendingCRFS',
          value: null
        }
      })
      dispatch({
        type: HIDE_BANNER
      });
      dispatch({
        type: TOGGLE_NOTIFICATION,
        payload: true,
        showTime: 3000,
        showType: 'success',
        showMessage: 'Curation completed successfully for Patient'
      })
      dispatch({
        type: SET_PROP,
        payload: {
          key: 'isCompletedRequired',
          value: true
        }
      })
      dispatch({
        type: SET_PROP,
        payload: {
          key: 'curationComplete',
          value: true
        }
      })
      dispatch({
        type: SET_PROP,
        payload: {
          key: 'answers',
          value: []
        }
      })
      window.location.href = '/';

    }).catch(function (err) {
      dispatch({
        type: TOGGLE_NOTIFICATION,
        payload: true,
        showTime: 3000,
        showType: 'error',
        showMessage: 'ERROR COMPLETING CURATION'
      })
    })
  }
}

export function SubmitTemplate(cb) {
  return (dispatch, getState) => {
    let isCRFValid = true;
    let childQuestions = getState().chartreview.childQuestions;
    let crfs = _.clone(getState().chartreview.availableCRFS);
    if (crfs.disabled) {
      return;
    }
    _.map(crfs.questions, (item) => {
      if ((_.isEmpty(item.parent_question) || _.find(childQuestions, { 'question_id': item.question_id })) && _.isEmpty(_.join(item.response, ','))) {
        isCRFValid = false;
        item.validationState = 'error';
      } else {
        item.validationState = null;
      }
    })
    dispatch({
      type: SET_PROP,
      payload: {
        key: 'availableCRFS',
        value: crfs
      }
    })
    if (!isCRFValid) {
      dispatch({
        type: TOGGLE_NOTIFICATION,
        payload: true,
        showTime: 3000,
        showType: 'error',
        showMessage: 'Not all questions answered. Please complete the form'
      })
      return;
    }
    dispatch({
      type: TOGGLE_NOTIFICATION,
      payload: true,
      showTime: null,
      showType: 'warning',
      showMessage: `Are you sure you want to submit CRF?`,
      messageTitle: 'Submit CRF',
      successCb: function () {
        let url = config.api.post_update_chart_review;
        let request = {
          patient_id: getState().chartreview.patientData.id,
          crf_template_id: getState().chartreview.currentTemplateId,
          project_id: getState().chartreview.ProjectId,
          cohort_id: getState().chartreview.cohortID,
          curator: getState().global.toJS().emailid,
          status: 'COMPLETED'
        };
        axios.post(url, request).then(function (response) {
          dispatch({
            type: HIDE_BANNER
          });
          dispatch({
            type: TOGGLE_NOTIFICATION,
            payload: true,
            showTime: 3000,
            showType: 'success',
            showMessage: 'CRF submitted successfully'
          })
          dispatch(GetPatientDetailsById())
          if (_.isFunction(cb)) {
            dispatch(cb())
          }
        }).catch(function (err) {
          dispatch({
            type: TOGGLE_NOTIFICATION,
            payload: true,
            showTime: 3000,
            showType: 'error',
            showMessage: 'ERROR SUBMITTING CRF'
          })
        })
      }
    })
  }
}


export function GetPatientsIDList(search) {
  return (dispatch, getState) => {
    let cohortId = getState().chartreview.cohortID
    let searchCriteria = search ? search.replace(/^[ ]+|[ ]+$/g, '') : ''
    if (cohortId) {
      let patientsIdUrl = searchCriteria ?  `${config.api.cohort_patient_ids.replace('_cohortId',cohortId)}?searchParam=${searchCriteria}` : `${config.api.cohort_patient_ids.replace('_cohortId',cohortId)}`
      axios.get(patientsIdUrl)
        .then(function (response) {
          dispatch({
            type: FETCH_PATIENTS_ID,
            payload: response.data
          })
        })
        .catch(function (error) {
          dispatch({
            type: TOGGLE_NOTIFICATION,
            showBanner: true,
            showTime: 3000,
            showType: 'error',
            showMessage: 'Error in Searching patient details'
          })
        })
    } else {
      dispatch({
        type: TOGGLE_NOTIFICATION,
        showBanner: true,
        showTime: 3000,
        showType: 'error',
        showMessage: 'Invalid Cohort ID found'
      })
    }
  }
}
export function GetPatientDetailsById(patientId = null) {
  return (dispatch, getState) => {

    dispatch({
      type: TOGGLE_LOADING,
      payload: true
    })
    let url = `/clinical/patients/fetch_next_patient/?project_id=${getState().chartreview.ProjectId}&cohort_id=${getState().chartreview.cohortID}`;
    if (!_.isEmpty(patientId)) {
      url += `&patient_id=${patientId}`
    }
    axios.get(url)
      .then(function (response) {
        if (_.isEmpty(response.data)) {
          dispatch({
            type: TOGGLE_NOTIFICATION,
            payload: true,
            showTime: 3000,
            showType: 'success',
            showMessage: 'No Patients Available'
          })
          dispatch({
            type: SET_PROP,
            payload: {
              key: 'patientData',
              value: null
            }
          })
          return;
        }
        dispatch({
          type: FETCH_PATIENTS_BY_ID,
          payload: response.data
        })
        dispatch({ type: SET_PATIENT_SECTIONS })
        dispatch(GetAvailableCRFS(getState().chartreview.ProjectId))
        dispatch({
          type: TOGGLE_LOADING,
          payload: false
        })
      })
      .catch(function (err) {
        dispatch({
          type: TOGGLE_NOTIFICATION,
          payload: true,
          showTime: 3000,
          showType: 'error',
          showMessage: err.message ? err.message : ''
        })

      }).then(function () {
        dispatch({
          type: TOGGLE_LOADING,
          payload: false
        })
      })

  }
};

export function TogglingCollapse(id, status) {
  return (dispatch) => {
    dispatch({
      type: TOGGLE_COLLAPSE,
      payload: id,
      status
    })
  }
}

export function ToggleAnnotation(id, quesId) {
  return (dispatch, getState) => {
    let crfs = _.clone(getState().chartreview.availableCRFS);
    _.map(crfs.questions, (item) => {
      if (item.id == id) {
        item.annotation_text = ' '
      }
    })
    //dispatch(optionsChanged({target:{value: []}}, id, quesId))
    dispatch({
      type: SET_PROP,
      payload: {
        key: 'availableCRFS',
        value: crfs
      }
    })
  }
}

export function handleEditEvent(event, id, quesId) {
  return (dispatch, getState) => {
    let currentTemplateId = getState().chartreview.currentTemplateId;
    let answers = getState().chartreview.answers;
    let options = getState().chartreview.annotationsOptions;
    let annotationText = _.clone(getState().chartreview.annotationText);
    if (_.isEmpty(annotationText)) {
      annotationText = {};
    }
    annotationText[quesId] = event.target.value;
    if (!options || !options[quesId]) {
      options = {
        quesId: []
      }
    }
    let tempAnswers = [{
      crf_template_question_id: id,
      responses: _.isEmpty(answers[currentTemplateId][_.toString(quesId)]) ? '' : _.join(answers[currentTemplateId][_.toString(quesId)], ','),
      annotation_text: _.trim(event.target.value),
      annotation_responses: options[quesId] ? options[quesId].join(',') : null
    }]
    dispatch({
      type: SET_PROP,
      payload: {
        key: 'annotationText',
        value: annotationText
      }
    })
    dispatch(_saveResponse(tempAnswers))
  }
}

export function optionsChanged(option, id, quesId, name) {
  if (option.length > 0) {
    return (dispatch, getState) => {
      var t = {
        opt: option[0].value,
        selected: option[0].selected
      };
      let options = _.clone(getState().chartreview[name]);
      let currentTemplateId = getState().chartreview.currentTemplateId;
      let answers = getState().chartreview.answers;
      let annotationText = getState().chartreview.annotationText;
      if (_.isEmpty(annotationText)) {
        annotationText = {};
      }

      if (_.isEmpty(options)) {
        options = {};
      }

      if (_.isEmpty(options[quesId])) {
        options[quesId] = [];
      }
      if (!t.selected) {
        _.remove(options[quesId], (item) => {
          return item == t.opt
        })
      } else {
        options[quesId].push(t.opt)
      }
      if (name == 'annotationOptions') {
        let tempAnswers = [{
          crf_template_question_id: id,
          responses: _.isEmpty(answers[currentTemplateId][_.toString(quesId)]) ? '' : _.join(answers[currentTemplateId][_.toString(quesId)], ','),
          annotation_text: annotationText[quesId],
          annotation_responses: options ? _.get(options, quesId, []).join(',') : ''
        }]
      }
      if (name == 'encounterDates') {
        let tempAnswers = [{
          crf_template_question_id: id,
          annotation_dates: _.isEmpty(answers[currentTemplateId][_.toString(quesId)]) ? '' : _.join(answers[currentTemplateId][_.toString(quesId)], ','),
          annotation_text: annotationText[quesId],
          annotation_responses: options ? _.get(options, quesId, []).join(',') : ''
        }]
      }
      dispatch(_saveResponse(tempAnswers))
      dispatch({
        type: SET_PROP,
        payload: {
          key: name,
          value: options
        }
      })
    }
  }
}

var _saveResponse = function (answers) {
  return (dispatch, getState) => {
    let currentTemplateId = getState().chartreview.currentTemplateId;
    let request = {
      patient_id: getState().chartreview.patientData.id,
      crf_template_id: currentTemplateId,
      project_id: getState().chartreview.ProjectId,
      cohort_id: getState().chartreview.cohortID,
      curator: getState().global.toJS().emailid,
      question_responses: answers
    };
    axios.post(config.api.get_chart_review, request)
      .then(function (response) { }).catch(function (err) {
        dispatch({
          type: TOGGLE_NOTIFICATION,
          payload: true,
          showTime: 3000,
          showType: 'error',
          showMessage: 'ERROR SAVING RESPONSE'
        })
      })
  }
}

export function addChild(question) {
  return (dispatch, getState) => {
    let childQuestions = getState().chartreview.childQuestions;
    if (!childQuestions) {
      childQuestions = []
    }
    if (_.isEmpty(_.find(childQuestions, (item) => { return item.question_id == question.question_id }))) {
      childQuestions.push(question);
      dispatch({
        type: SET_PROP,
        payload: {
          key: 'childQuestions',
          value: childQuestions
        }
      })
    };
  }
}

export function removeChild(question) {
  return (dispatch, getState) => {
    let childQuestions = getState().chartreview.childQuestions;
    if (!childQuestions) {
      childQuestions = []
    }
    _.remove(childQuestions, (item) => {
      return item.question_id == question.question_id;
    })

    dispatch({
      type: SET_PROP,
      payload: {
        key: 'childQuestions',
        value: childQuestions
      }
    })
  }
}

//action handlers
const ACTION_HANDLERS = {
  [FETCH_PATIENTS_ID]: (state, action) => {
    return Object.assign({}, state, {
      patientIDList: action.payload
    })
  },
  [FETCH_PATIENTS_BY_ID]: (state, action) => {
    let PatientData = action.payload;
    return Object.assign({}, state, {
      patientData: PatientData,
      totalPatients: 0,
      patientSerialNo: 0
    })
  },
  [SET_PROP]: (state, action) => {
    return Object.assign({}, state, {
      [action.payload.key]: action.payload.value
    })
  },
  [TOGGLE_COLLAPSE]: (state, action) => {
    let patientData = Object.assign({}, state.patientData)
    let encounters = []
    state.patientData.encounters.map((ed, i) => {
      if (ed.id == action.payload) {
        ed.collapse = action.status
      }
      encounters.push(ed)
    })
    return Object.assign({}, state, {
      patientData: Object.assign({}, patientData, {
        encounters: encounters,
        collapsibleId: action.payload
      })
    })
  },
  [CLEAR_DATA]: (state, action) => {
    return Object.assign({}, state, initialState)
  },
  [SET_PATIENT_SECTIONS]: (state, action) => {
    let sections = ['diagnosys', 'joint_exam', 'note', 'procedure', 'questionnaire', 'provider', 'observation', 'insurance', 'medication_record', 'procedure']
    let ac = [];
    if (state.patientData) {
      if (state.patientData.encounters && state.patientData.encounters.length > 0) {
        ac.push({
          value: 'encounters'
        })
        state.patientData.encounters.map((en, i) => {
          _.mapKeys(en, function (value, key) {
            if (sections.indexOf(key.toLowerCase()) > -1 && value && value.length > 0 && _.map(ac.options, function (a) {
              return a.value.toLowerCase()
            }).indexOf(key.toLowerCase()) == -1)
              ac.push({
                value: key,
                selected: false
              })
          })
        })
      }
    }
    return Object.assign({}, state, {
      patientSections: ac
    })
  }
}


//reducer
const initialState = {
  patientData: null,
  totalPatients: 0,
  patientIDList: [],
  patientSerialNo: 0,
  cohortID: 0,
  answers: {},
  annotations: {},
  question_type_text: ['text', 'numeric']
}
export default function chartReviewReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ?
    handler(state, action) :
    state
}
