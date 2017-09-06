import {
  USER_LOG_IN,
  USERNAME_CHANGED,
  TOGGLE_LOGGEDIN_ROLE,
  USER_ROLE
} from '../../../modules/global.js';
import {
  push
} from 'react-router-redux';
import {
  browserHistory
} from 'react-router';
import axios from '../../../lib/axios';
import config from '../../../config';
import {
  ValidateUserEmail
} from '../../../lib/utils.js';


const INPUT_CHANGE = 'INPUT_CHANGE';
const CLEAR_USER = 'CLEAR_USER';
const AUTH_GOOGLE = 'AUTH_GOOGLE';
const VALIDATE_INPUT = 'VALIDATE_INPUT';
const INVALID_AUTH_CODE = 'INVALID_AUTH_CODE';
const INVALID_EMAIL = 'INVALID_EMAIL';
const TOGGLE_NOTIFICATION = 'TOGGLE_NOTIFICATION';
const HIDE_BANNER = 'HIDE_BANNER';
const SET_PROP = 'SET_PROP';

export function handleEvent(event) {
  return (dispatch) => {
    dispatch({
      type: INPUT_CHANGE,
      payload: {
        key: event.target.name,
        value: event.target.value
      }
    })
    if (event.target.name == 'username') {
      dispatch({
        type: USERNAME_CHANGED,
        payload: event.target.value
      })
    }
  }
}

export function HideBanner() {
  return (dispatch, getState) => {
    dispatch({
      type: HIDE_BANNER
    })
  }
}

export function ForgotPassword() {
  return (dispatch, getState) => {
    dispatch({
      type: AUTH_GOOGLE,
      payload: 'ForgotPassword'
    })
  }
}

export function SendForgotPasswordLink() {
  return (dispatch, getState) => {
    var isValidEmail = ValidateUserEmail(getState().Login.username.value);

    if (isValidEmail) {

      axios.get(config.api.forgot_password, {
          params: {
            email: getState().Login.username.value
          }
        })
        .then(function (response) {

        }).catch(function (err) {
          console.log('ERROR', err);
        })
      dispatch({
        type: AUTH_GOOGLE,
        payload: 'ConfirmEmailSent'
      })
    } else {
      dispatch({
        type: INVALID_EMAIL,
        payload: {
          username: {
            value: '',
            validationState: 'error',
            helpBlockText: 'Invalid Email'
          }
        }
      })
    }
  }
}

export function RedirectToLogin() {
  window.location.href = '/login';
}

export function LogIn() {
  return (dispatch, getState) => {
    dispatch({
      type: VALIDATE_INPUT
    });

    if (!getState().Login.isValidInput) {
      return;
    }

    let obj = {
      email: getState().Login.username.value,
      password: getState().Login.password.value
    }
    axios
      .post(config.api.login, obj)
      .then(function (response) {
        if (response && response.status == config.HTTP_Status.success) {
          dispatch({
            type: USER_LOG_IN,
            payload: true
          })

          dispatch({
            type: AUTH_GOOGLE,
            payload: 'GoogleAuth'
          })

          let otpLabel = 'Enter your Google Authentication Code';
          if (response.data.mfa_type && response.data.mfa_type.toLowerCase() == 'sms') {
            otpLabel = `OTP has been sent to your mobile ${response.data.phone_number}, please enter the same here to login.`;

            dispatch({
              type: SET_PROP,
              payload: {
                key: 'show_resend_link',
                value: true
              }
            })
          }

          dispatch({
            type: SET_PROP,
            payload: {
              key: 'OTPLabel',
              value: otpLabel
            }
          })
        }
      })
      .catch(function (err) {
        dispatch({
          type: SET_PROP,
          payload: {
            key: 'InvalidLoginMessage',
            value: err && err.response && err.response.data && err.response.data.message ? err.response.data.message : 'Invalid Login Attempt'
          }
        })
      })
  }
};

export function Authenticate() {
  return (dispatch, getState) => {

    if (!getState().Login.authCode.value) {
      return dispatch({
        type: INVALID_AUTH_CODE,
        payload: 'Enter Auth Code'
      })
    }

    let obj = {
      email: getState().Login.username.value,
      password: getState().Login.password.value,
      token: getState().Login.authCode.value
    }
    axios
      .post(config.api.verify_mfa_token, obj)
      .then(function (response) {
        if (response.data && response.status == config.HTTP_Status.success) {
          localStorage.setItem('access_token', response.data.api_token);
          localStorage.setItem('logged_user', response.data.user.email);
          localStorage.setItem('logged_user_first_name', response.data.user.first_name);
          localStorage.setItem('logged_user_role', response.data.user.groups[0].name);
          localStorage.setItem('password_expiry_on', response.data.user.password_expiry_on);
          dispatch({
            type: TOGGLE_LOGGEDIN_ROLE,
            payload: response.data.user && response.data.user.groups && response.data.user.groups.length > 0 ? response.data.user.groups[0].name : 'curator'
          })

          dispatch({
            type: USER_ROLE,
            payload: response.data.user.groups[0].name
          })
          window.location.href = '/';
        } else {
          dispatch({
            type: INVALID_AUTH_CODE,
            payload: 'Invalid Auth Code'
          })
        }
      })
      .catch(function (err) {
        console.log(`ERROR WHILE LOGIN ${err}`);

        dispatch({
          type: INVALID_AUTH_CODE,
          payload: 'Invalid Auth Code'
        })
      })
  }
}


const ACTION_HANDLERS = {
  [INPUT_CHANGE]: (state, action) => {
    return Object.assign({}, state, {
      [action.payload.key]: {
        value: action.payload.value.trim()
      },
      InvalidLoginMessage: null
    })
  },
  [CLEAR_USER]: (state, action) => {
    return Object.assign({}, state, initialState)
  },
  [VALIDATE_INPUT]: (state, action) => {
    var modifiedState = {
      isValidInput: true
    };
    var isValidEmail = ValidateUserEmail(state.username.value);

    if (!isValidEmail) {
      modifiedState.isValidInput = false;
      modifiedState.username = {
        value: state.username.value ? state.username.value : '',
        validationState: 'error',
        helpBlockText: 'Invalid Email'
      }
    }

    if (!state.password.value) {
      modifiedState.isValidInput = false;
      modifiedState.password = {
        value: '',
        validationState: 'error',
        helpBlockText: 'Invalid Password'
      }
    }
    return Object.assign({}, state, {
      ...modifiedState
    })
  },
  [AUTH_GOOGLE]: (state, action) => {
    return Object.assign({}, state, {
      currentPage: action.payload
    })
  },
  [SET_PROP]: (state, action) => {
    return Object.assign({}, state, {
      [action.payload.key]: action.payload.value
    })
  },
  [INVALID_AUTH_CODE]: (state, action) => {
    return Object.assign({}, state, {
      authCode: {
        value: '',
        validationState: 'error',
        helpBlockText: action.payload
      }
    });
  },
  [INVALID_EMAIL]: (state, action) => {
    return Object.assign({}, state, {
      ...action.payload
    })
  },
  [TOGGLE_NOTIFICATION]: (state, action) => {
    return Object.assign({}, state, {
      banner: { ...action.payload
      }
    })
  },
  [HIDE_BANNER]: (state, action) => {
    return Object.assign({}, state, {
      banner: {
        showBanner: false
      }
    })
  }
}
const initialState = {
  username: {
    value: '',
    validationState: '',
    helpBlockText: ''
  },
  password: {
    value: '',
    validationState: '',
    helpBlockText: ''
  },
  authCode: {
    value: '',
    validationState: ''

  },
  message: '',
  currentPage: 'AuthOne',
  isValidInput: false,
  banner: {
    showBanner: false,
    showTime: 3000,
    showType: 'error',
    showMessage: 'Invalid Login Attempt'
  }
}
export default function loginReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  return handler ?
    handler(state, action) :
    state
}
