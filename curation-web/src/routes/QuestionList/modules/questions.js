import axios from 'lib/axios'
import {HIDE_BANNER, TOGGLE_NOTIFICATION, TOGGLE_LOADING} from '../../../modules/global.js'
import _ from 'lodash'
const LOAD_QUESTIONS_DATA = 'LOAD_QUESTIONS_DATA'
const TOGGLE_MODAL = 'TOGGLE_MODAL'
const OPTION_ADDED = 'OPTION_ADDED'
const REMOVE_OPTION = 'REMOVE_OPTION'
const SAVE_QUESTION = 'SAVE_QUESTION'
const SET_PROPS = 'SET_PROPS'
const USER_INPUT_CHANGE = 'USER_INPUT_CHANGE'
const VALIDATE_QUESTION = 'VALIDATE_QUESTION'

export function LoadQuestionsData(page, sizeperpage) {
  return (dispatch, getState) => {
    getState().question.showAddModal = false
    if (page && sizeperpage) {
      dispatch({ type: SET_PROPS, payload: { key: 'searchParam', value: null } })
      dispatch({ type: SET_PROPS, payload: { key: 'page', value: page } })
      dispatch({ type: SET_PROPS, payload: { key: 'sizeperpage', value: sizeperpage } })
    }
    let getUrl = getState().question.searchParam ? `/clinical/crfquestions/?page=${getState().question.page}&page_size=${getState().question.sizeperpage}&searchParam=${getState().question.searchParam}` :
      `/clinical/crfquestions/?page=${getState().question.page}&page_size=${getState().question.sizeperpage}`
    if (getState().question.sortName) {
      getUrl += `&sortName=${getState().question.sortName}&sortOrder=${getState().question.sortOrder}`;
    }
    dispatch({ type: TOGGLE_LOADING, payload: true })
    axios.get(getUrl)
      .then(function (response) {
        dispatch({
          type: LOAD_QUESTIONS_DATA,
          payload: response.data
        })
        dispatch({ type: TOGGLE_LOADING, payload: false })
      })
      .catch(function (errors) {
        dispatch({ type: TOGGLE_LOADING, payload: false })
        dispatch({
          type: TOGGLE_NOTIFICATION,
          showBanner: true,
          showTime: 3000,
          showType: 'error',
          showMessage: GetErrorMessage(errors.response.data)
        })
      })
  }
}

function GetErrorMessage(errors) {
  if (errors && !errors.detail) {
    let errorMessage = errors
    let error = []
    error = errors && (Object.keys(errors) && Object.keys(errors).length > 0) && Object.values(errors)
      && Object.values(errors).length > 0
      && Object.values(Object.values(errors)[0])
      && Object.values(Object.values(errors)[0])[0]
      ? Object.values(Object.values(errors)[0])[0] : null

    if (errors && errors.errors && errors.errors.non_field_errors) {
      error = Object.values(errors.errors.non_field_errors)
    }
    try {
      errorMessage = error && error.length > 0 ? error[0] : errorMessage
    } catch (e) {
      errorMessage = errorMessage
    }
    return errorMessage && typeof (errorMessage) == 'string' ? errorMessage[0].charAt(0).toUpperCase() + errorMessage.slice(1) : null
  }
  return errors && errors.detail ? errors.detail : null
}
export function handleEditEvent(event) {
  return (dispatch) => {
    dispatch({
      type: USER_INPUT_CHANGE,
      payload: {
        key: event.target.name,
        value: event.target.value
      }
    })
  }
}
export function SearchQuestion(event) {
  return (dispatch) => {
    dispatch({ type: SET_PROPS, payload: { key: 'searchParam', value: event.target.value } })
    dispatch(LoadQuestionsData())
  }
}
export function SortChange(sortName, sortOrder) {
  return (dispatch) => {
    dispatch({ type: SET_PROPS, payload: { key: 'sortName', value: sortName } })
    dispatch({ type: SET_PROPS, payload: { key: 'sortOrder', value: sortOrder } })
    dispatch(LoadQuestionsData())
  }
}
export function PageChanged(page, sizePerPage) {
  return (dispatch) => {
    dispatch({ type: SET_PROPS, payload: { key: 'page', value: page ? page : 1 } })
    dispatch({ type: SET_PROPS, payload: { key: 'sizeperpage', value: sizePerPage } })
    dispatch(LoadQuestionsData())
  }
}
export function SizePerPageListChange(sizePerPage) {
  return (dispatch) => {
    dispatch({ type: SET_PROPS, payload: { key: 'page', value: 1 } })
    dispatch({ type: SET_PROPS, payload: { key: 'sizeperpage', value: sizePerPage } })
    dispatch(LoadQuestionsData())
  }
}
export function toggleModal(id, key) {
  return (dispatch) => {
    dispatch({
      type: TOGGLE_MODAL,
      payload: id,
      key: key
    })
  }
}
export function OptionAdded() {
  return (dispatch) => {
    dispatch({
      type: OPTION_ADDED
    })
  }
}
export function RemoveOption(index) {
  return (dispatch) => {
    dispatch({
      type: REMOVE_OPTION,
      payload: index
    })
  }
}
export function SaveQuestion() {
  return (dispatch, getState) => {
    dispatch({
      type: VALIDATE_QUESTION
    })
    if (getState().question.isValid) {
      dispatch({
        type: SAVE_QUESTION
      })
      let method = getState().question.saveObject && getState().question.saveObject.id ? 'put' : 'post'
      let saveUrl = getState().question.saveObject && getState().question.saveObject.id ? `/clinical/crfquestions/${getState().question.saveObject.id}/` : `/clinical/crfquestions/`
      dispatch({ type: TOGGLE_LOADING, payload: true })
      axios[method](saveUrl, getState().question.saveObject)
        .then(function (response) {
          dispatch({ type: TOGGLE_LOADING, payload: false })
          dispatch({
            type: TOGGLE_NOTIFICATION,
            showBanner: true,
            showTime: 3000,
            showType: 'success',
            showMessage: method == 'post' ? 'Question Added Successfully'
              : (method == 'put' && getState().question.saveObject) ? ((getState().question.saveObject.is_active) ? 'Question Updated Successfully' : 'Question Deleted successfully')
                : 'Action executed successfully'
          })
          dispatch(LoadQuestionsData())
        })
        .catch(function (errors) {
          dispatch({ type: TOGGLE_LOADING, payload: false })
          dispatch({
            type: TOGGLE_NOTIFICATION,
            showBanner: true,
            showTime: 3000,
            showType: 'error',
            showMessage: GetErrorMessage(errors.response.data)
          })
        })
    }
  }
}
const ACTION_HANDLERS = {
  [USER_INPUT_CHANGE]: (state, action) => {
    let objType = state.selectedObject ? 'selectedObject' : 'newQuestion'
    let obj = { text: action.payload.key, value: action.payload.value, validationState: null, help: '' }
    if (action.payload.key != 'responses') {
      let newQues = Object.assign({}, state[objType], {
        [action.payload.key]: obj
      })
      if (newQues.type && newQues.type.value && newQues.type.value != 'numeric') {
        newQues.responses = newQues.type && newQues.type.value != '0' && newQues.type.value != 'text' && newQues.type.value != 'date' ? newQues.responses : null
      } else {
        newQues.responses = null
      }
      return Object.assign({}, state, { [objType]: newQues, responses: '', showOptions: newQues.type && newQues.type.value && newQues.type.value != '0' && newQues.type.value != 'text' && newQues.type.value != 'date' ? true : false })
    } else {
      let respObj = state[objType] && state[objType].responses ? state[objType].responses : { text: action.payload.key, validationState: null, help: '' }
      if (respObj) { respObj.validationState = null, respObj.help = '' }
      let resObj = Object.assign({}, state[objType], {
        [action.payload.key]: respObj
      })
      return Object.assign({}, state, {
        [objType]: resObj, [action.payload.key]: action.payload.value,
        showOptions: state[objType].type && state[objType].type.value != '0' && state[objType].type.value != 'text' && state[objType].type.value != 'date' ? true : false
      })
    }
  },
  [LOAD_QUESTIONS_DATA]: (state, action) => {
    return Object.assign({}, state, { questions: action.payload, isDeletable: false, totalCount: action.payload.count })
  },
  [TOGGLE_MODAL]: (state, action) => {
    if (action.payload) {

      let selectedObject = _.filter(state.questions.results, function (q) {
        return q.id == action.payload
      })
      selectedObject = selectedObject && selectedObject.length > 0 ? selectedObject[0] : {}
      let Obj = {
        id: selectedObject.id,
        type: { value: selectedObject.type, text: 'type' },
        text: { value: selectedObject.text, text: 'text' },
        responses: { value: selectedObject.responses && selectedObject.type != 'numeric' ? selectedObject.responses.split(',') : null, text: 'responses' },
        description: { value: selectedObject.description, text: 'description' },
        responseMinValue: {
          value: selectedObject.type == 'numeric'
            && selectedObject.responses && selectedObject.responses.split(',').length > 0
            ? selectedObject.responses.split(',')[0] : ''
        },
        responseMaxValue: {
          value: selectedObject.type == 'numeric'
            && selectedObject.responses && selectedObject.responses.split(',').length > 0
            ? selectedObject.responses.split(',')[1] : ''
        },
        is_active: selectedObject.is_active
      }
      return Object.assign({}, state, {
        showAddModal: !state.showAddModal, selectedObject: Obj,
        showOptions: Obj.type && Obj.type.value != '0' && Obj.type.value != 'text' && Obj.type.value != 'date' ? true : false,
        isDeletable: action.key == 'delete' ? true : false
      })
    }
    return Object.assign({}, state, { showAddModal: !state.showAddModal, showOptions: false, newQuestion: {}, selectedObject: null })
  },
  [OPTION_ADDED]: (state, action) => {
    let selectedObj = state.selectedObject ? 'selectedObject' : 'newQuestion'

    let options = [];
    let selectedObject = Object.assign({}, state[selectedObj])
    if (selectedObject.responses && selectedObject.responses.value) {
      selectedObject.responses.value.map((so, i) => {
        options.push(so)
      })
    }
    selectedObject.responses = selectedObject.responses ? selectedObject.responses : []
    if (selectedObject.responses && state.responses && state.responses.replace(/^[ ]+|[ ]+$/g, '')) {
      if (_.map(options, function (o) { return o.toLowerCase() }).indexOf(state.responses.replace(/^[ ]+|[ ]+$/g, '').toLowerCase()) == -1) {
        options.push(state.responses)
      }
      else {
        selectedObject.responses.help = `${state.responses} is already in Responses`
      }
    }
    selectedObject.responses.value = options;
    selectedObject.responses.validationState = options.length > 0 ? null : error
    return Object.assign({}, state, {
      [selectedObj]: selectedObject,
      responses: null
    })

  },
  [REMOVE_OPTION]: (state, action) => {
    let options = [];
    let selectedObj = state.selectedObject ? 'selectedObject' : 'newQuestion'
    if (state[selectedObj]) {
      let selectedObject = Object.assign({}, state[selectedObj])
      selectedObject.responses.value.map((res, i) => {
        if (i != action.payload) {
          options.push(res)
        }
      })
      selectedObject.responses.value = options;
      return Object.assign({}, state, {
        [selectedObj]: selectedObject
      })
    }
    return Object.assign({}, state)
  },
  [VALIDATE_QUESTION]: (state, action) => {
    let valid = true
    let validatingObj = state.selectedObject ? Object.assign({}, state.selectedObject) : Object.assign({}, state.newQuestion)
    if (validatingObj) {
      if (!validatingObj.text || !validatingObj.text.value) {
        validatingObj.text = validatingObj.text ? validatingObj.text : {}
        validatingObj.text.validationState = 'error'
        validatingObj.text.help = 'Question Text is required'
        valid = false
      }
      if (validatingObj.text && validatingObj.text.value) {
        if (validatingObj.text.value.length > 250) {
          validatingObj.text.validationState = 'error'
          validatingObj.text.help = 'Question Text Should not exceed 250 characters'
          valid = false
        }
      }
      if (!validatingObj.type || !validatingObj.type.value || validatingObj.type.value == '0') {
        validatingObj.type = validatingObj.type ? validatingObj.type : {}
        validatingObj.type.validationState = 'error'
        validatingObj.type.help = 'Question Type is required'
        valid = false
      }
      if (validatingObj.type && validatingObj.type.value && (!(validatingObj.type.value == 'text' || validatingObj.type.value == 'date'
        || validatingObj.type.value == '0' || validatingObj.type.value == 'numeric'))) {
        if (!validatingObj.responses || !validatingObj.responses.value || validatingObj.responses.value.length == 0) {
          validatingObj.responses = validatingObj.responses ? validatingObj.responses : {}
          validatingObj.responses.validationState = 'error'
          validatingObj.responses.help = 'Atleast one Response is required'
          valid = false
        }
      }
      if (!validatingObj.description || !validatingObj.description.value) {
        validatingObj.description = validatingObj.description ? validatingObj.description : {}
        validatingObj.description.validationState = 'error'
        validatingObj.description.help = 'Question Description is required'
        valid = false
      }
      if (validatingObj.type && validatingObj.type.value == 'numeric') {
        if (validatingObj.responseMaxValue && validatingObj.responseMaxValue.value && validatingObj.responseMinValue && validatingObj.responseMinValue.value) {
          if (parseInt(validatingObj.responseMaxValue.value) < parseInt(validatingObj.responseMinValue.value)) {
            validatingObj.responseMaxValue.validationState = 'error'
            validatingObj.responseMaxValue.help = 'Minimum value should not be greater than Maximum value in Range'
            valid = false
          }
        }
      }
    }
    return state.selectedObject ?
      Object.assign({}, state, { isValid: valid, selectedObject: validatingObj }) :
      Object.assign({}, state, { isValid: valid, newQuestion: validatingObj })
  },
  [SAVE_QUESTION]: (state, action) => {
    let saveObj = {};
    let selectedObject = state.selectedObject ? state.selectedObject : state.newQuestion
    saveObj.id = selectedObject.id
    saveObj.text = selectedObject.text.value
    saveObj.type = selectedObject.type.value
    saveObj.responses = selectedObject.type.value != 'text' && selectedObject.type.value != 'date' ? (selectedObject.type.value != 'numeric' ? (selectedObject.responses.value ? selectedObject.responses.value.join(',') : '')
      : (selectedObject.responseMinValue && selectedObject.responseMinValue.value ? selectedObject.responseMinValue.value : 'None')
      + ','
      + (selectedObject.responseMaxValue && selectedObject.responseMaxValue.value ? selectedObject.responseMaxValue.value : 'None')) : ""

    saveObj.description = selectedObject.description.value
    saveObj.is_active = state.isDeletable ? false : true
    return Object.assign({}, state, {
      questionOptions: null, showOptions: false, responseMinValue: null,
      responseMaxValue: null, selectedObject: null, showAddModal: !state.showAddModal, newQuestion: null, saveObject: saveObj
    })
  },
  [SET_PROPS]: (state, action) => {
    return Object.assign({}, state, { [action.payload.key]: action.payload.value })
  }
}

const initialState = {
  questions: null,
  showAddModal: false,
  Page: 1,
  selectedObject: null,
  questionTypes: [{ value: 'single', label: 'Single' }, { value: 'multiple', label: 'Multiple' }, { value: 'numeric', label: 'Numeric' }, { value: 'text', label: 'Text' }, { value: 'date', label: 'Date' }],
  showOptions: false,
  questionOptions: null,
  quesOpt: null,
  newQuestion: {},
  isDeletable: false,
  totalCount: 0
}
export default function questionReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler
    ? handler(state, action)
    : state
}