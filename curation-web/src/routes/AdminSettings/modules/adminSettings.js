import axios from '../../../lib/axios';
import _ from 'lodash';
import config from '../../../config'

import {
  HIDE_BANNER,
  TOGGLE_NOTIFICATION,
  TOGGLE_LOADING
} from '../../../modules/global.js';


const SET_PROP = 'SET_PROP';
const SETTINGS_DATA = 'SETTINGS_DATA';
const SUBMIT_SETTING = 'SUBMIT_SETTING';
const CANCEL_EDITING = 'CANCEL_EDITING';
const VALIDATE_SETTINGS = 'VALIDATE_SETTINGS';
const SET_SERVER_VALIDATION = 'SET_SERVER_VALIDATION';

//action creators
export function GetAdminSettings() {
  return (dispatch) => {
    let groupedData = []
    let groups = []
    dispatch({ type: TOGGLE_LOADING, payload: true })
    axios.get(config.api.get_admin_settings)
      .then(function (response) {
        if (response && response.data) {
          groupedData = response.data.results
          groups = [...new Set(response.data.results.map(item => item.settings_group))]
        }
        dispatch({
          type: SETTINGS_DATA,
          payload: groupedData,
          groups
        })
        dispatch({ type: TOGGLE_LOADING, payload: false })
      })
      .catch(function (errors) {
        dispatch({
          type: TOGGLE_NOTIFICATION,
          showBanner: true,
          showTime: 3000,
          showType: 'error',
          showMessage: 'Error in fetching Settings'
        })
        dispatch({ type: TOGGLE_LOADING, payload: false })
      })
  }
}
export function HandleTextEdit(event) {
  return (dispatch) => {
    dispatch({
      type: SET_PROP,
      payload: {
        key: event.target.name,
        value: event.target.value
      }
    })
  }
}
export function SubmitSettings() {
  return (dispatch, getState) => {
    dispatch({
      type: VALIDATE_SETTINGS
    })
    if (getState().adminsettings.isValid) {
      axios.post(config.api.get_admin_settings, getState().adminsettings.SettingsData)
        .then(function (response) {
          dispatch({
            type: TOGGLE_NOTIFICATION,
            showBanner: true,
            showTime: 3000,
            showType: 'success',
            showMessage: 'Settings Successfully updated'
          })
          dispatch(GetAdminSettings())
        })
        .catch(function (errors) {
          if (errors && errors.response && errors.response.data && errors.response.data.errors) {
            dispatch({
              type: SET_SERVER_VALIDATION,
              payload: errors && errors.response && errors.response.data && errors.response.data.errors ? errors.response.data.errors : null
            })
          }
          else {
            dispatch({
              type: TOGGLE_NOTIFICATION,
              showBanner: true,
              showTime: 3000,
              showType: 'error',
              showMessage: 'Unable to Update Settings'
            })
          }
        })
    }
  }
}
export function CancelEditing() {
  return (dispatch) => {
    dispatch({
      type: TOGGLE_NOTIFICATION,
      payload: true,
      showTime: null,
      showType: 'warning',
      showMessage: 'Are you sure want to cancel changes ?',
      messageTitle: 'Cancel Changes',
      successCb: function () {
        dispatch(GetAdminSettings())
        dispatch({
          type: HIDE_BANNER
        })
      }
    })
  }
}
//action handlers
const ACTION_HANDLERS = {
  [SET_PROP]: (state, action) => {
    let settingsObj = []
    if (action.payload && state.SettingsData) {
      state.SettingsData.map((sd, i) => {
        if (sd.setting == action.payload.key) {
          sd.ValidationState = null
          sd.Help = null
          sd.value = action.payload.value
        }
        settingsObj.push(sd)
      })
    }
    return Object.assign({}, state, {
      SettingsData: settingsObj
    })
  },
  [SETTINGS_DATA]: (state, action) => {
    return Object.assign({}, state, { SettingsData: action.payload, groups: action.groups })
  },
  [VALIDATE_SETTINGS]: (state, action) => {
    let valid = true
    if (state.SettingsData) {
      state.SettingsData.map((sd, i) => {
        if (!sd.value) {
          valid = false
          sd.ValidationState = 'error'
        }
      })
    }
    return Object.assign({}, state, { isValid: valid })
  },
  [SET_SERVER_VALIDATION]: (state, action) => {
    let settingsData = []
    if (state.SettingsData) {
      state.SettingsData.map((sd, i) => {
        if (action.payload && Object.keys(action.payload).indexOf(sd.setting) > -1) {
          sd.ValidationState = 'error'
          sd.Help = action.payload[sd.setting] && action.payload[sd.setting].length > 0 ? (action.payload[sd.setting][0]).charAt(0).toUpperCase() + (action.payload[sd.setting][0]).slice(1) : null
        }
        settingsData.push(sd)
      })
    }
    return Object.assign({}, state, { SettingsData: settingsData })
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
