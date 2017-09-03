import axios from 'lib/axios';
import { ValidateUserEmail,  getUrlParameter,  ValidateRegEx } from '../../../lib/utils.js';
import { push } from 'react-router-redux';
import { ValidateUserPassword } from '../../../lib/utils.js';
import config from '../../../config';
import _ from 'lodash';

const RESET_PASSWORD_SUCCESS = 'RESET_PASSWORD_SUCCESS';
const SET_UUID = 'SET_UUID';
const INPUT_CHANGE = 'INPUT_CHANGE';
const SET_ERROR = 'SET_ERROR';

export function ResetPasswordSuccess() {
  return (dispatch, getState) => {
    var isPasswordValid = null;
    if (!getState().resetpassword.password) {
      isPasswordValid = 'error';
    }
    dispatch({
      type: SET_ERROR,
      payload: {
        key: 'passwordValidationState',
        value: isPasswordValid
      }
    });
    if (ValidateUserPassword(getState().resetpassword.password) && getState().resetpassword.password == getState().resetpassword.confirmPassword) {
      axios.post('/auth/reset_password/', {
          uuid: getState().resetpassword.uuid,
          password: getState().resetpassword.password
        })
        .then(function (response) {
          if (response.status == config.HTTP_Status.success) {
            if(response.data.mfaUrl){
              dispatch({
                type: INPUT_CHANGE,
                payload: {
                  key: 'mfaurl',
                  value: response.data.mfaUrl
                }
              })
            }
            dispatch({
              type: RESET_PASSWORD_SUCCESS
            })
          }
        }).catch(function (err) {
          dispatch({
            type: SET_ERROR,
            payload: {
              key: 'error',
              value: err.response.data.message
            }
          });

          dispatch({
            type: SET_ERROR,
            payload: {
              key: 'passwordValidationState',
              value: err.response.data.errors.new_password
            }
          });
        })
    }
  }
};

export function handleEvent(event) {
  return (dispatch, getState) => {

    dispatch({
      type: INPUT_CHANGE,
      payload: {
        key: event.target.name,
        value: event.target.value.trim()
      }
    })
    if (event.target.name == 'password') {
      let passwordValidations = [];
      passwordValidations = _validatePassword(event.target.value.trim())
      dispatch({
        type: INPUT_CHANGE,
        payload: {
          key: 'passwordValidations',
          value: passwordValidations
        }
      })
    }

    let passwordValidations =  _validatePassword(getState().resetpassword.password)
    if (!_.isEmpty(getState().resetpassword.password) && getState().resetpassword.password == getState().resetpassword.confirmPassword) {
      passwordValidations.push({
            class: 'text-success',
            icon: 'fa fa-check',
            message: 'Passwords must match'
        })
    } else{
        passwordValidations.push({
            class: 'text-danger',
            icon: 'fa fa-times',
            message: 'Passwords must match'
        })
    }
      dispatch({
        type: INPUT_CHANGE,
        payload: {
          key: 'passwordValidations',
          value: passwordValidations
        }
      })
  }
}

var _validatePassword = function (value) {
    /* Password Validations */
    let passwordValidations = [];
    if (ValidateRegEx(/^(?=.*[a-z]).+$/, value)) {
        passwordValidations.push({
            class: 'text-success',
            icon: 'fa fa-check',
            message: '1 Lower case'
        })
    } else {
        passwordValidations.push({
            class: 'text-danger',
            icon: 'fa fa-times',
            message: '1 Lower case'
        })
    }

    if (ValidateRegEx(/^(?=.*[A-Z]).+$/, value)) {
        passwordValidations.push({
            class: 'text-success',
            icon: 'fa fa-check',
            message: '1 Upper case'
        })
    } else {
        passwordValidations.push({
            class: 'text-danger',
            icon: 'fa fa-times',
            message: '1 Upper case'
        })
    }

    if (ValidateRegEx(/^(?=.*\d).+$/, value)) {
        passwordValidations.push({
            class: 'text-success',
            icon: 'fa fa-check',
            message: '1 Digit'
        })
    } else {
        passwordValidations.push({
            class: 'text-danger',
            icon: 'fa fa-times',
            message: '1 Digit'
        })
    }


    if (ValidateRegEx(/^(?=.*[_\W]).+$/, value)) {
        passwordValidations.push({
            class: 'text-success',
            icon: 'fa fa-check',
            message: '1 Symbol'
        })
    } else {
        passwordValidations.push({
            class: 'text-danger',
            icon: 'fa fa-times',
            message: '1 Symbol'
        })
    }


    if (value && value.length >= 8) {
        passwordValidations.push({
            class: 'text-success',
            icon: 'fa fa-check',
            message: 'Atleast 8 Characters'
        })
    } else {
        passwordValidations.push({
            class: 'text-danger',
            icon: 'fa fa-times',
            message: 'Atleast 8 Characters'
        })
    }

    return passwordValidations;
}


export function GetUserId() {
  return (dispatch, getState) => {
    if (!getState().resetpassword.uuid) {
      window.location.href = '/login';
    }
  }
};

export function SetUUID(uuid) {
  return (dispatch, getState) => {
    dispatch({
      type: SET_UUID,
      payload: uuid
    })
  }
}

export function RedirectToLogin() {
  window.location.href = '/login';
}

//action handlers
const ACTION_HANDLERS = {
  [RESET_PASSWORD_SUCCESS]: (state, action) => {
    return Object.assign({}, state, {
      currentPage: 'ScanGoogleAuth'
    })
  },

  [SET_UUID]: (state, action) => {
    return Object.assign({}, state, {
      uuid: action.payload
    })
  },

  [INPUT_CHANGE]: (state, action) => {
    return Object.assign({}, state, {
      [action.payload.key]: action.payload.value
    })
  },
  [SET_ERROR]: (state, action) => {
    return Object.assign({}, state, {
      [action.payload.key]: action.payload.value
    })
  }
}


//reducer
const initialState = {
  currentPage: 'PasswordResetForm',
  uuid: null,
  password: '',
  confirmPassword: '',
  error: '',
  passwordValidationState: '',
  passwordValidations:[
    {
      class: 'text-danger',
      icon: 'fa fa-times',
      message: '1 Lower case'
    },
    {
      class: 'text-danger',
      icon: 'fa fa-times',
      message: '1 Upper case'
    },
    {
      class: 'text-danger',
      icon: 'fa fa-times',
      message: '1 Digit'
    },
    {
      class: 'text-danger',
      icon: 'fa fa-times',
      message: '1 Symbol'
    },
    {
      class: 'text-danger',
      icon: 'fa fa-times',
      message: 'Atleast 8 characters'
    },
    {
      class: 'text-danger',
      icon: 'fa fa-times',
      message: 'Passwords must match'
    }
  ]
}
export default function homeReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
