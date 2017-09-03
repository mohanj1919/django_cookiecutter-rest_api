import axios from 'lib/axios';
import _ from 'lodash';

import {
  HIDE_BANNER,
  TOGGLE_NOTIFICATION,
  TOGGLE_LOADING
} from '../../../modules/global.js';

const SET_PROP = 'SET_PROP';
const TEMPLATE_DETAILS = 'TEMPLATE_DETAILS';
const TEXT_EDITED = 'TEXT_EDITED';
const TEMPLATE_SELECTED = 'TEMPLATE_SELECTED';
const VALIDATE_TEMPLATE = 'VALIDATE_TEMPLATE';

export function TextEdited(content, id, instance) {
  return (dispatch) => {
    dispatch({
      type: TEXT_EDITED,
      payload: {
        key: 'template',
        value: content,
        id,
        instance
      }
    })
  }
}
export function SetCurrentInstance(ref) {
  return (dispatch) => {
    dispatch({
      type: SET_PROP,
      payload: {
        key: 'currentInstance',
        value: ref
      }
    })
  }
}
export function SubjectChanged(e, id) {
  return (dispatch) => {
    dispatch({
      type: TEXT_EDITED,
      payload: {
        key: e.target.name,
        value: e.target.value,
        id
      }
    })
  }
}
export function TemplateSelected(e) {
  return (dispatch) => {
    dispatch({
      type: TEMPLATE_SELECTED,
      payload: e.target.value
    })
  }
}
export function DefaultTextSelected(value) {
  return (dispatch, getState) => {
    const cursorPosition = getState().emailtemplatedesigner.currentInstance && getState().emailtemplatedesigner.currentInstance.getEditor()
      && getState().emailtemplatedesigner.currentInstance.getEditor().getSelection()
      && getState().emailtemplatedesigner.currentInstance.getEditor().getSelection().index
      ? getState().emailtemplatedesigner.currentInstance.getEditor().getSelection().index : null
    if (cursorPosition != null && getState().emailtemplatedesigner.currentInstance && getState().emailtemplatedesigner.currentInstance.getEditor()) {
      getState().emailtemplatedesigner.currentInstance.getEditor().insertText(cursorPosition, value.replace(/^[ ]+|[ ]+$/g, ''))
      getState().emailtemplatedesigner.currentInstance.getEditor().setSelection(cursorPosition + 1)
    }
  }
}
export function CancelTemplateDetails() {
  return (dispatch, getState) => {
    dispatch({
      type: TOGGLE_NOTIFICATION,
      payload: true,
      showTime: null,
      showType: 'warning',
      showMessage: 'Are you sure to cancel Editing Template ?',
      messageTitle: 'Cancel Editing Template',
      successCb: function () {
        dispatch({ type: HIDE_BANNER })
        dispatch(GetTemplateDetails())
        dispatch({
          type: TOGGLE_NOTIFICATION, payload: true, showTime: 4000, showType: 'success',
          showMessage: 'Changes Successfully discarded'
        })
      }
    })
  }
}

export function SaveTemplateDetails() {
  return (dispatch, getState) => {
    dispatch({ type: VALIDATE_TEMPLATE })
    if (getState().emailtemplatedesigner.isValid) {
      dispatch({ type: TOGGLE_LOADING, payload: true })
      axios.put(`/clinical/emailtemplates/${getState().emailtemplatedesigner.selectedTemplateData.id}/`, getState().emailtemplatedesigner.selectedTemplateData)
        .then(function (response) {
          dispatch(GetTemplateDetails())
          dispatch({ type: TOGGLE_NOTIFICATION, payload: true, showTime: 3000, showType: 'success', showMessage: 'Template Saved Successfully' })
          dispatch({ type: TOGGLE_LOADING, payload: false })
        })
        .catch(function (errors) {
          dispatch({ type: TOGGLE_LOADING, payload: false })
        })
    }
  }
}
export function GetTemplateDetails() {
  return (dispatch) => {
    dispatch({ type: TOGGLE_LOADING, payload: true })
    axios.get('/clinical/emailtemplates/')
      .then(function (response) {
        dispatch({
          type: TEMPLATE_DETAILS,
          payload: response.data && response.data.results && response.data.results.length > 0 ? response.data.results : null
        })
        dispatch({ type: TOGGLE_LOADING, payload: false })
      })
      .catch(function (errors) {
        dispatch({ type: TOGGLE_LOADING, payload: false })

      })
  }
}

//action handlers
const ACTION_HANDLERS = {
  [SET_PROP]: (state, action) => {
    return Object.assign({}, state, {
      [action.payload.key]: action.payload.value
    })
  },
  [VALIDATE_TEMPLATE]: (state, action) => {
    let valid = true;
    let errorText = '';
    if (state.selectedTemplateData.template) {
      let placeholders = state.selectedTemplateData.place_holders ? state.selectedTemplateData.place_holders.split(',') : []
      if (placeholders.length > 0) {
        let missedPlaceHolders = []
        placeholders.map((ph, j) => {
          if (state.selectedTemplateData.template.indexOf(ph.replace(/^[ ]+|[ ]+$/g, '')) == -1) {
            missedPlaceHolders.push(ph)
          }
        })
        if (missedPlaceHolders && missedPlaceHolders.length > 0) {
          missedPlaceHolders = missedPlaceHolders.join(',')
          valid = false
          errorText = missedPlaceHolders + ' missing in template'
        }
      }
    }
    else {
      valid = false;
      errorText = 'Template text is required'
    }
    return Object.assign({}, state, {
      isValid: valid,
      errorText
    })
  },
  [TEXT_EDITED]: (state, action) => {
    if (state.templateData && action.payload && !_.isUndefined(action.payload.value)) {
      let tempData = Object.assign({}, state.selectedTemplateData, {
        [action.payload.key]: action.payload.value,
        valid: action.payload.key == 'template' ? true : state.valid,
        errorText: action.payload.key == 'template' ? null : state.errorText
      })
      if (action.payload.instance) {
        return Object.assign({}, state, { selectedTemplateData: tempData, currentInstance: action.payload.instance })
      }
      return Object.assign({}, state, { selectedTemplateData: tempData })
    }
    return Object.assign({}, state)
  },
  [TEMPLATE_DETAILS]: (state, action) => {
    if (action.payload) {
      let selectedInd = 0
      if (state.selectedTemplateData) {
        action.payload.map((st, i) => {
          if (st.id == state.selectedTemplateData.id) {
            selectedInd = i
          }
        })
      }
      return Object.assign({}, state, { templateData: action.payload, selectedTemplateData: action.payload && action.payload.length ? action.payload[selectedInd] : null })
    }
    return Object.assign({}, state)
  },
  [TEMPLATE_SELECTED]: (state, action) => {
    if (action.payload) {
      let selectedTemplateData = {}
      if (state.templateData) {
        state.templateData.map((st, i) => {
          if (st.id == parseInt(action.payload)) {
            selectedTemplateData = Object.assign({}, st)
          }
        })
      }
      return Object.assign({}, state, { selectedTemplateData: selectedTemplateData, valid: true, errorText: null })
    }
  }
}


//reducer
const initialState = {

}
export default function chartReviewReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ?
    handler(state, action) :
    state
}
