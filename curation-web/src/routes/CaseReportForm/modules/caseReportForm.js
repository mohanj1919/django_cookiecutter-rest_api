import axios from '../../../lib/axios'
import {HIDE_BANNER, TOGGLE_NOTIFICATION, TOGGLE_LOADING} from '../../../modules/global.js';
import config from '../../../config'
const CRFS_LIST = 'CRFS_LIST'
const DELETE_MODAL_TOGGLE = 'DELETE_MODAL_TOGGLE'
const DELETE_CONFIRMATION = 'DELETE_CONFIRMATION'
const SEARCH_CRF = 'SEARCH_CRF'
const SET_PROPS = 'SET_PROPS'
const CLEAR_DATA = 'CLEAR_DATA'

export function GetCRFs() {
  return (dispatch, getState) => {
    dispatch({ type: HIDE_BANNER })
    dispatch({ type: SET_PROPS, payload: { type: 'page', value: 1 } })
    dispatch({ type: SET_PROPS, payload: { type: 'sizeperpage', value: 10 } })
    dispatch({ type: TOGGLE_LOADING, payload: true })
    axios.get(config.api.get_crf_templates, {
      params: {
        page: getState().casereportform.page,
        page_size: getState().casereportform.sizeperpage
      }
    })
      .then(function (response) {
        dispatch({
          type: CRFS_LIST,
          payload: response.data
        })
        dispatch({ type: TOGGLE_LOADING, payload: false })
      })
      .catch(function (error) {
        dispatch({ type: TOGGLE_LOADING, payload: false })
        dispatch({
          type: TOGGLE_NOTIFICATION,
          showBanner: true,
          showTime: 3000,
          showType: 'error',
          showMessage: error.message
        })
      })
  }
}
function GetCRFList() {
  return (dispatch, getState) => {
    let searchparam = getState().casereportform.searchParam;
    let apiparams = searchparam ? { page: getState().casereportform.page, page_size: getState().casereportform.sizeperpage, searchParam: getState().casereportform.searchParam }
      : { page: getState().casereportform.page, page_size: getState().casereportform.sizeperpage }
    
    if (getState().casereportform.sortName) {
      apiparams.sortName = getState().casereportform.sortName
      apiparams.sortOrder = getState().casereportform.sortOrder
    }
    dispatch({ type: TOGGLE_LOADING, payload: true })
    axios.get(config.api.get_crf_templates, { params: apiparams})
      .then(function (response) {
        dispatch({
          type: CRFS_LIST,
          payload: response.data
        })
        dispatch({ type: TOGGLE_LOADING, payload: false })
      })
      .catch(function (error) {
        dispatch({ type: TOGGLE_LOADING, payload: false })
        dispatch({
          type: TOGGLE_NOTIFICATION,
          showBanner: true,
          showTime: 3000,
          showType: 'error',
          showMessage: error.message
        })
      })
  }
}
export function OnPageChanged(page, sizePerPage) {
  return (dispatch, getState) => {
    dispatch({ type: SET_PROPS, payload: { type: 'page', value: page } })
    dispatch({ type: SET_PROPS, payload: { type: 'sizeperpage', value: sizePerPage } })
    dispatch(GetCRFList())
  }
}

export function SortChange(sortName, sortOrder) {
  return (dispatch, getState) => {
    dispatch({ type: SET_PROPS, payload: { type: 'sortName', value: sortName } });
    dispatch({ type: SET_PROPS, payload: { type: 'sortOrder', value: sortOrder } });
    return dispatch(GetCRFList());
  }
}

export function DeleteModal(id) {
  return (dispatch, getState) => {
    dispatch({
      type: DELETE_MODAL_TOGGLE,
      payload: id
    })
    dispatch({
      type: TOGGLE_NOTIFICATION,
      payload: true,
      showTime: null,
      showType: 'warning',
      showMessage: `Are you sure you want to delete this CRF template ?`,
      messageTitle: 'Delete CRF Template',
      successCb: function () {
        let url = `/clinical/crftemplates/${getState().casereportform.deletableCrfId}/`
        dispatch({ type: TOGGLE_LOADING, payload: true })

        axios.delete(url).then(function (response) {
          dispatch({ type: TOGGLE_LOADING, payload: false })
          dispatch({ type: SET_PROPS, payload: { type: 'page', value: 1 } })
          dispatch(GetCRFList())
          dispatch({ type: HIDE_BANNER })
          dispatch({
            type: TOGGLE_NOTIFICATION, payload: true, showTime: 3000, showType: 'success',
            showMessage: 'CRF template Successfully Deleted'
          })
        })
          .catch(function (error) {
            dispatch({ type: TOGGLE_LOADING, payload: false })
            let errorMessage = 'Unable to delete CRF';
            if (error.response.data.errors) {
              let errors = error.response.data.errors;
              if (errors.crf_templates) {
                errorMessage = errors.crf_templates;
              }
            }
            return dispatch({
              type: TOGGLE_NOTIFICATION,
              payload: true,
              showTime: 3000,
              showType: 'error',
              showMessage: errorMessage
            })
          })
      }
    })
  }
}
export function SearchCRF(eve) {
  return (dispatch, getState) => {
    let searchCriteria = eve && eve.target ? eve.target.value.replace(/^[ ]+|[ ]+$/g, '') : '';
    dispatch({ type: SET_PROPS, payload: { type: 'searchParam', value: searchCriteria } })
    dispatch({ type: SET_PROPS, payload: { type: 'page', value: 1 } })
    dispatch(GetCRFList())
  }
}

export function ClearData() {
  return (dispatch) => {
    dispatch({ type: CLEAR_DATA })
  }
}

const ACTION_HANDLERS = {
  [CRFS_LIST]: (state, action) => {
    let crfs = [];
    if (action.payload && action.payload.results) {
      action.payload.results.map((ap) => {
        ap.total_questions = ap.questions ? ap.questions.length : 0
        crfs.push(ap)
      })
    }
    return Object.assign({}, state, { crfData: crfs, totalCount: action.payload.count })
  },
  [DELETE_MODAL_TOGGLE]: (state, action) => {
    return Object.assign({}, state, { deletableCrfId: action.payload })
  },

  [SEARCH_CRF]: (state, action) => {
    return Object.assign({}, state)
  },
  [SET_PROPS]: (state, action) => {
    return Object.assign({}, state, { [action.payload.type]: action.payload.value })
  },
  [CLEAR_DATA]: (state, action) => {
    return Object.assign({}, state, {...initialState})
  }
}
const initialState = {
  crfData: null,
  deleteModal: null,
  showDeleteModal: false,
  deletableCrfId: null,
  searchParam: ''
}
export default function caseReportFormsReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler
    ? handler(state, action)
    : state
}