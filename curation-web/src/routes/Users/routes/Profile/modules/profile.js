import axios from '../../../../../lib/axios';
import {
  HIDE_BANNER,
  TOGGLE_NOTIFICATION,
  TOGGLE_LOADING,
  ValidateUserToken
} from '../../../../../modules/global.js';
import config from '../../../../../config';
import {
  ValidateUserEmail,
  getUrlParameter,
  ValidateRegEx,
  ValidateUserPassword
} from '../../../../../lib/utils.js';
import {
  browserHistory
} from 'react-router'
import _ from 'lodash'

const SET_PROP = 'SET_PROP';
const SET_USER_DETAILS = 'SET_USER_DETAILS';


export function handleEvent(event) {
  return (dispatch, getState) => {
    dispatch({
      type: SET_PROP,
      payload: {
        key: event.target.name,
        value: event.target.value
      }
    })
    if (event.target.name == 'password') {
      let passwordValidations = [];
      passwordValidations = _validatePassword(event.target.value.trim())
      dispatch({
        type: SET_PROP,
        payload: {
          key: 'passwordValidations',
          value: passwordValidations
        }
      })
    }
    if (event.target.name == 'password' || event.target.name == 'confirmPassword') {
      let passwordValidations = _validatePassword(getState().profile.password)
      if (!_.isEmpty(getState().profile.password) && getState().profile.password == getState().profile.confirmPassword) {
        passwordValidations.push({
          class: 'text-success',
          icon: 'fa fa-check',
          message: 'Passwords must match'
        })
      } else {
        passwordValidations.push({
          class: 'text-danger',
          icon: 'fa fa-times',
          message: 'Passwords must match'
        })
      }
      dispatch({
        type: SET_PROP,
        payload: {
          key: 'passwordValidations',
          value: passwordValidations
        }
      })
    }
  }
}

export function GetUserDetails() {
  return (dispatch, getState) => {
    axios.get('/users/get_current_user_details/').then(function (response) {
      let user = {
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        email: response.data.email,
        id: response.data.id,
        phone_number: response.data.phone_number
      }
      dispatch({
        type: SET_USER_DETAILS,
        payload: user
      })
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



export function submitFormFunction() {
  return (dispatch, getState) => {
    let request = {
      "first_name": getState().profile.first_name,
      "last_name": getState().profile.last_name
    };
    let isValid = true;
    if (_.isEmpty(getState().profile.first_name)) {
      dispatch({
        type: SET_PROP,
        payload: {
          key: 'firstNameValidationState',
          value: 'error'
        }
      });
      isValid = false;
    } else {
      dispatch({
        type: SET_PROP,
        payload: {
          key: 'firstNameValidationState',
          value: null
        }
      });
    }

    if (_.isEmpty(getState().profile.last_name)) {
      dispatch({
        type: SET_PROP,
        payload: {
          key: 'lastNameValidationState',
          value: 'error'
        }
      });
      isValid = false;
    } else {
      dispatch({
        type: SET_PROP,
        payload: {
          key: 'lastNameValidationState',
          value: null
        }
      });
    }

    if (!isValid) {
      return
    }

    if (!_.isEmpty(getState().profile.password) || !_.isEmpty(getState().profile.currentpassword) || !_.isEmpty(getState().profile.confirmPassword)) {
      if (_.isEmpty(getState().profile.currentpassword)) {
        dispatch({
          type: SET_PROP,
          payload: {
            key: 'passwordValidationState',
            value: 'error'
          }
        });
        return
      } else if (!ValidateUserPassword(getState().profile.password) || getState().profile.password != getState().profile.confirmPassword) {
        return
      } else {
        request.change_password = {
          "old_password": getState().profile.currentpassword,
          "new_password": getState().profile.password,
          "confirm_new_password": getState().profile.confirmPassword
        }
      }
    }

    let url = `/users/${getState().profile.id}/update_profile/`;
    axios.post(url, request)
      .then(function (response) {
        let state = {};
        state.password = '';
        state.currentpassword = '';
        state.confirmPassword = '';
        state.passwordValidations = initialState.passwordValidations;
        state.passwordValidationState = null;
        localStorage.setItem('logged_user_first_name', getState().profile.first_name);
        dispatch(ValidateUserToken())
        dispatch({
          type: SET_USER_DETAILS,
          payload: state
        })
        dispatch({
          type: TOGGLE_NOTIFICATION,
          payload: true,
          showTime: 3000,
          showType: 'success',
          showMessage: 'User details updated successfully'
        })
        dispatch(SetServerErrors(null))
      }).catch(function (err) {
        dispatch(SetServerErrors(err.response.data))

        dispatch({
          type: TOGGLE_NOTIFICATION,
          payload: true,
          showTime: 3000,
          showType: 'error',
          showMessage: 'Failed updating details'
        })
      })

  }
};


function SetServerErrors(err) {
  return (dispatch) => {
    dispatch({
      type: SET_PROP,
      payload: {
        key: 'passwordValidationState',
        value: err && !_.isEmpty(err.errors.old_password) ? 'error' : null
      }
    });
    dispatch({
      type: SET_PROP,
      payload: {
        key: 'newPasswordValidationState',
        value: err && !_.isEmpty(err.errors.new_password) ? err.errors.new_password : null
      }
    });

  }
}

export function CancelUpdate() {
  return (dispatch, getState) => {
    dispatch({
      type: TOGGLE_NOTIFICATION,
      payload: true,
      showTime: null,
      showType: 'warning',
      showMessage: `Are you sure you want to Cancel Editing?`,
      messageTitle: 'Cancel Update',
      successCb: function () {
        dispatch({
          type: HIDE_BANNER
        })
        browserHistory.push('/')
      }
    })
  }
}

const ACTION_HANDLERS = {
  [SET_PROP]: (state, action) => {
    return Object.assign({}, state, {
      [action.payload.key]: action.payload.value
    })
  },
  [SET_USER_DETAILS]: (state, action) => {
    return Object.assign({}, state, { ...action.payload
    });
  }
}

//reducer
const initialState = {
  passwordValidations: [{
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
export default function loginReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  return handler ?
    handler(state, action) :
    state
}
