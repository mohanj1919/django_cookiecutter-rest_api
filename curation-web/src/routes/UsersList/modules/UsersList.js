import axios from '../../../lib/axios';
import { HIDE_BANNER, TOGGLE_NOTIFICATION, TOGGLE_LOADING } from '../../../modules/global.js';
import { ValidateUserEmail } from '../../../lib/utils.js';
import config from '../../../config';
import _ from 'lodash';
import { formatPhoneNumber, parsePhoneNumber, isValidPhoneNumber } from 'react-phone-number-input'
const FETCH_USER = 'FETCH_USER';
const TOGGLE_MODAL = 'TOGGLE_MODAL';
const EDIT_USER = 'EDIT_USER';
const USER_INPUT_CHANGE = 'USER_INPUT_CHANGE';
const SAVE_USER = 'SAVE_USER';
const SET_PROP = 'SET_PROP';
const SET_ERRORS = 'SET_ERRORS';


export function fetchUsers() {
  return (dispatch, getState) => {
    getState().userslist.showModal = false
    dispatch({ type: HIDE_BANNER })
    dispatch({ type: TOGGLE_LOADING, payload: true })
    axios.get(config.api.get_mfa_type)
      .then(function (response) {
        if (response.data) {
          let dataObj = []
          _.map(response.data, (value, key) => {
            dataObj.push({ value: (value == 'sms') ? value.toUpperCase() : value.charAt(0).toUpperCase() + value.slice(1), key: key })
          })
          if (dataObj && dataObj.length > 0) {
            dispatch({
              type: SET_PROP,
              payload: {
                key: 'mfaTypes',
                value: dataObj
              }
            })
          }
        }
      })
      .catch(function (errors) {
        dispatch({ type: TOGGLE_NOTIFICATION, payload: true, showTime: 3000, showType: 'error', showMessage: 'Error Fetching Multi-factor authentication Details' })
      }).then(function () {
        dispatch({ type: TOGGLE_LOADING, payload: false })
      })
    return new Promise((resolve) => {
      let rolesUrl = config.api.get_roles
      axios.get(rolesUrl).then(function (response) {
        if (response.status == config.HTTP_Status.success) {
          dispatch({ type: SET_PROP, payload: { key: 'allRoles', value: response.data } })
        }
      })
        .catch((error) => {
          dispatch({ type: TOGGLE_NOTIFICATION, payload: true, showTime: 3000, showType: 'error', showMessage: 'ERROR FETCHING ROLES' })
        })
      let url = config.api.get_users + '?page=1';
      axios.get(url).then(function (response) {
        if (response.status == config.HTTP_Status.success) {
          dispatch({ type: FETCH_USER, payload: response.data })
        }
      })
        .catch((error) => {
          dispatch({ type: TOGGLE_NOTIFICATION, payload: true, showTime: 3000, showType: 'error', showMessage: 'ERROR FETCHING USERS' })
        })
    })
  }
};

var _getRoleIdByRole = function (state, role) {
  var role = state.allRoles.find((item) => {
    if (item.id == role || item.name == role) {
      return item.id;
    }
  });
  return role;
}

export function SaveUser() {
  return (dispatch, getState) => {
    return new Promise((resolve) => {
      if (getState().userslist) {
        let saveObj = (getState().userslist.selectedObject)
          ? getState().userslist.selectedObject
          : (getState().userslist.newUser)
            ? getState().userslist.newUser
            : { id: null }
        if (!saveObj) {
          saveObj = { isValid: false };
        } else {
          var resetValidations = {
            first_nameValidationState: null,
            last_nameValidationState: null,
            emailValidationState: null,
            roleValidationState: null,
            phone_numberValidationState: null,
            mfaValidationState: null,
            isValid: true
          };
          saveObj = Object.assign({}, saveObj, { ...resetValidations });
  }
  if (!saveObj.first_name) {
    saveObj.first_nameValidationState = 'error';
    saveObj.isValid = false;
  }

  if (!saveObj.last_name) {
    saveObj.last_nameValidationState = 'error';
    saveObj.isValid = false;
  }

  if (!saveObj.email || !ValidateUserEmail(saveObj.email)) {
    saveObj.emailValidationState = 'error';
    saveObj.isValid = false;
  }

  if (!saveObj.role || saveObj.role == '0') {
    saveObj.roleValidationState = 'error';
    saveObj.isValid = false;
  }
  saveObj.phone_numberValidationState = null
  saveObj.mfa_typeValidationState = null
  if (!saveObj.mfa_type) {
    saveObj.mfa_typeValidationState = 'error';
    // saveObj.mfa_typeHelp = 'Please choose Multi Factor Authentication type';
    saveObj.isValid = false;
  } else if (saveObj.mfa_type && saveObj.mfa_type == '0') {
    saveObj.mfa_typeValidationState = 'error';
    // saveObj.mfa_typeHelp = 'Please choose Multi Factor Authentication type';
    saveObj.isValid = false;
  } else {
    if (saveObj.mfa_type == 'sms') {
      if (!saveObj.phone_number) {
        saveObj.phone_numberValidationState = 'error';
        // saveObj.phone_numberHelp = 'Mobile number is required';
        saveObj.isValid = false;
      } else if (!isValidPhoneNumber(saveObj.phone_number)) {
        saveObj.phone_numberValidationState = 'error';
        saveObj.phone_numberHelp = 'Invalid mobile number';
        saveObj.isValid = false
      }
    }
  }

  if (!saveObj.isValid) {
    dispatch({
      type: SET_PROP,
      payload: {
        key: 'selectedObject',
        value: { ...saveObj }
}
          });
return;
        }
saveObj.groups = [_getRoleIdByRole(getState().userslist, saveObj.role).id];

if (!saveObj.groups) {
  return;
}
let url = getState().userslist.selectedObject.id
  ? `/users/${getState().userslist.selectedObject.id}/`
  : `/users/`;

dispatch({ type: TOGGLE_LOADING, payload: true })
if (getState().userslist.selectedObject.id) {
  axios.put(url, saveObj).then(function (response) {
    if (response.status == config.HTTP_Status.success) {
      dispatch({ type: TOGGLE_MODAL });
      dispatch({ type: TOGGLE_NOTIFICATION, payload: true, showTime: 3000, showType: 'success', showMessage: 'User Updated Successfully' })
      dispatch({ type: TOGGLE_LOADING, payload: false });
      dispatch(PageChange(getState().userslist.pageNumber, getState().userslist.pageSize));
    }
  })
    .catch((error) => {
      dispatch({ type: TOGGLE_LOADING, payload: false });
      dispatch(_showServerErrors(error.response.data.errors));
    })

} else {
  let request = {
    first_name: saveObj.first_name,
    last_name: saveObj.last_name,
    groups: saveObj.groups,
    mfa_type: saveObj.mfa_type,
    phone_number: saveObj.phone_number,
    email: saveObj.email
  };
  axios
    .post(url, request)
    .then(function (response) {
      if (response.status == config.HTTP_Status.CREATE_SUCCESS) {
        dispatch({ type: TOGGLE_MODAL });
        dispatch({ type: TOGGLE_LOADING, payload: false });
        dispatch({
          type: TOGGLE_NOTIFICATION,
          payload: true,
          showTime: 3000,
          showType: 'success',
          showMessage: 'User Added Successfully'
        });
        dispatch(PageChange(getState().userslist.pageNumber, getState().userslist.pageSize));
      }
    })
    .catch((error) => {
      dispatch({ type: TOGGLE_LOADING, payload: false });
      dispatch(_showServerErrors(error.response.data.errors));
    });
}
      }
    })
  }
}

var _showServerErrors = function (serverErrors) {
  return (dispatch, getState) => {
    var userObj = { ...getState().userslist.selectedObject };
    if (!serverErrors) return;
    userObj.first_nameValidationState = serverErrors.first_name ? 'error' : null;
    userObj.last_nameValidationState = serverErrors.last_name ? 'error' : null;
    userObj.emailValidationState = serverErrors.email ? 'error' : null;

    userObj.first_nameHelp = serverErrors.first_name;
    userObj.last_nameHelp = serverErrors.last_name;
    userObj.emailHelp = serverErrors.email;

    dispatch({
      type: SET_ERRORS,
      payload: {
        key: 'selectedObject',
        value: userObj
      }
    });
  }
}

export function DeleteUser(id) {
  return (dispatch, getState) => {
    return new Promise((resolve) => {

      if (getState().userslist) {
        let deleteObj = _getUserById(getState().userslist, id)
        dispatch({
          type: TOGGLE_NOTIFICATION,
          payload: true,
          showTime: null,
          showType: 'warning',
          showMessage: !deleteObj.curator_chart_reviews ? `Are you sure you want to delete user "${deleteObj.email}" ?`
            : `"${deleteObj.email}" is involved in Patient Curation, are you sure want to delete this User?`,
          messageTitle: 'Delete User',
          successCb: function () {
            let url = !deleteObj.curator_chart_reviews ? `/users/${deleteObj.id}/` : `/users/${deleteObj.id}/confirm_delete/`
            axios.delete(url).then(function (response) {
              if (response.status == config.HTTP_Status.DELETE_SUCCESS) {
                dispatch({ type: HIDE_BANNER })
                dispatch(PageChange(getState().userslist.pageNumber, getState().userslist.pageSize));
                dispatch({ type: TOGGLE_NOTIFICATION, payload: true, showTime: 3000, showType: 'success', showMessage: 'User Deleted Successfully' })
              }
            })
              .catch((error) => {
                dispatch({
                  type: TOGGLE_NOTIFICATION,
                  payload: true,
                  showTime: 3000,
                  showType: 'error',
                  showMessage: 'Unable to delete user'
                })
              })
          }
        })
      }
    })
  }
}

export function SortChange(sortName, sortOrder) {
  return (dispatch, getState) => {
    dispatch({ type: SET_PROP, payload: { key: 'sortName', value: sortName } });
    dispatch({ type: SET_PROP, payload: { key: 'sortOrder', value: sortOrder } });
    return dispatch(PageChange(getState().userslist.pageNumber, getState().userslist.pageSize));
  }
}
export function PageChange(page, sizePerPage) {
  return (dispatch, getState) => {
    let param = {
      page: page,
      page_size: sizePerPage
    }
    if (getState().userslist.searchTerm) {
      param.searchParam = getState().userslist.searchTerm
    }
    if (getState().userslist.sortName) {
      param.sortName = getState().userslist.sortName
      param.sortOrder = getState().userslist.sortOrder
    }
    axios.get(config.api.get_users, { params: { ...param } }).then(function (response) {
      if (response.status == config.HTTP_Status.success) {
        dispatch({ type: FETCH_USER, payload: response.data })
        dispatch({ type: SET_PROP, payload: { key: 'pageSize', value: sizePerPage } })
        dispatch({ type: SET_PROP, payload: { key: 'pageNumber', value: page } })
      }
    })
      .catch((error) => {
        dispatch(PageChange(1, getState().userslist.pageSize))
      })
  }
}

export function SearchUser(searchText, colInfos, multiColumnSearch) {
  return (dispatch, getState) => {
    var searchTerm = searchText.target.value;
    dispatch({ type: SET_PROP, payload: { key: 'searchTerm', value: searchTerm } })
    dispatch({ type: SET_PROP, payload: { key: 'Page', value: 1 } })
    return dispatch(PageChange(1, getState().userslist.pageSize));
  }
}
export function MobileNumberChanged(val) {
  var validationState = `phone_numberValidationState`
  return (dispatch) => {
    dispatch({
      type: USER_INPUT_CHANGE,
      payload: {
        key: 'phone_number',
        value: val,
        validationState
      }
    })
  }
}
export function handleEditEvent(event) {
  return (dispatch) => {
    var validationState = `${event.target.name}ValidationState`
    dispatch({
      type: USER_INPUT_CHANGE,
      payload: {
        key: event.target.name,
        value: event.target.value,
        validationState
      }
    })
  }
}

export function EditUserList(userid, isDelete = null) {
  return (dispatch) => {
    dispatch({ type: EDIT_USER, payload: userid, isDeletable: isDelete })
  }
}

export function ResetUserPassword(userEmail, isResetPassword = null) {
  return (dispatch) => {
    dispatch({
      type: SET_PROP, payload: {
        key: 'showResetModal',
        value: true
      }
    })
    dispatch({
      type: SET_PROP, payload: {
        key: 'userResetEmail',
        value: userEmail
      }
    })
  }
}

export function ConfirmResetUserPassword() {
  return (dispatch, getState) => {
    dispatch({ type: TOGGLE_LOADING, payload: true })
    axios.get(config.api.reset_password, { params: { email: getState().userslist.userResetEmail } }).then((response) => {
      dispatch({ type: TOGGLE_NOTIFICATION, payload: true, showTime: 3000, showType: 'success', showMessage: 'Password reset successful' })
    }).catch((error) => {
      dispatch({ type: TOGGLE_NOTIFICATION, payload: true, showTime: 3000, showType: 'error', showMessage: 'ERROR RESETTING PASSWORD' })
    }).then(function () {
      dispatch({ type: TOGGLE_LOADING, payload: false })
      dispatch({
        type: SET_PROP, payload: {
          key: 'showResetModal',
          value: false
        }
      })
    });
  }
}

export function toggleEmailReset() {
  return (dispatch) => {
    dispatch({
      type: SET_PROP, payload: {
        key: 'showResetModal',
        value: false
      }
    })
  }
}

export function toggleActive(e) {
  return (dispatch, getState) => {
    let currentObject = getState().userslist.selectedObject;
    currentObject.is_account_locked = e;

    dispatch({
      type: SET_PROP,
      payload: {
        key: 'selectedObject',
        value: currentObject
      }
    })
  }
}

export function toggleModal() {
  return (dispatch) => {
    dispatch({ type: TOGGLE_MODAL })
  }
}

function _getUserById(state, id) {
  return state
    .users
    .find((u) => {
      if (u.id == parseInt(id)) {
        if (!u.groups.length) {
          u.role = '';
        }
        else { u.role = u.groups[0].name; }
        return u;
      }
    })
}

const ACTION_HANDLERS = {
  [FETCH_USER]: (state, action) => {
    return Object.assign({}, state, {
      users: action.payload.results,
      totalCount: action.payload.count
    })
  },
  [TOGGLE_MODAL]: (state, action) => {
    if (state.showModal) {
      return Object.assign({}, state, {
        showModal: !state.showModal,
        selectedObject: { id: null },
        isDelete: null,
        error: null
      });
    }
    return Object.assign({}, state, {
      showModal: !state.showModal
    });
  },
  [EDIT_USER]: (state, action) => {
    let editobj = {};
    let newState = Object.assign({}, state);
    editobj = _getUserById(newState, action.payload);

    return Object.assign({}, state, {
      showModal: !state.showModal,
      selectedObject: editobj,
      isDelete: action.isDeletable
    });
  },
  [USER_INPUT_CHANGE]: (state, action) => {
    let objType = state.selectedObject ? 'selectedObject' : 'newUser'
    let updatedObj = Object.assign({}, state[objType], {
      [action.payload.key]: action.payload.value,
      [action.payload.validationState]: null,
      [action.payload.key + 'Help']: null,
    })
    return Object.assign({}, state, { [objType]: updatedObj })
  },
  [SET_PROP]: (state, action) => {
    return Object.assign({}, state, { [action.payload.key]: action.payload.value })
  },

  [SET_ERRORS]: (state, action) => {
    return Object.assign({}, state, { [action.payload.key]: {...action.payload.value}})
  }
}

//reducer
const initialState = {
  users: [],
  showModal: false,
  selectedObject: { id: null },
  isDelete: false,
  newUser: null,
  allRoles: [],
  error: null,
  pageSize: 10,
  pageNumber: 1,
  Page: 1,
  searchTerm: null,
  sortName: null,
  sortOrder: null
}
export default function loginReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  return handler
    ? handler(state, action)
    : state
}
