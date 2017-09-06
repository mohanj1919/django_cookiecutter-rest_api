import axios from '../../../../../lib/axios';
import {HIDE_BANNER, TOGGLE_NOTIFICATION, TOGGLE_LOADING} from '../../../../../modules/global.js';
import config from '../../../../../config';
import { browserHistory } from 'react-router'
import _ from 'lodash'

const SET_PROP = 'SET_PROP';
const SET_COHORT_DATA = 'SET_COHORT_DATA';

export function handleEvent(event) {
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

export function SortChange(sortName, sortOrder) {
  return (dispatch, getState) => {
    dispatch({ type: SET_PROP, payload: { key: 'sortName', value: sortName } });
    dispatch({ type: SET_PROP, payload: { key: 'sortOrder', value: sortOrder } });
    return dispatch(PageChange(getState().projectslist.pageNumber, getState().projectslist.pageSize));
  }
}

export function SearchCohort(searchText, colInfos, multiColumnSearch) {
  return (dispatch, getState) => {
    var searchTerm = searchText.target.value;
    dispatch({ type: SET_PROP, payload: { key: 'searchTerm', value: searchTerm.trim() } })
    dispatch({ type: SET_PROP, payload: { key: 'Page', value: 1 } })

    return dispatch(PageChange(1, getState().projectslist.pageSize));
  }
}

export function EditCohortsList(id) {
  return (dispatch) => {
    browserHistory.push(`/projects/configure/${id}`)
  }
}

export function DeleteCohort(id) {
  return (dispatch, getState) => {

    return new Promise((resolve) => {

      if (getState().projectslist) {
        let deleteObj = _getCohortById(getState().projectslist, id)
        dispatch({
          type: TOGGLE_NOTIFICATION,
          payload: true,
          showTime: null,
          showType: 'warning',
          showMessage: `Are you sure you want to delete Cohort "${deleteObj.name}" ?`,
          messageTitle: 'Delete Cohort',
          successCb: function () {
            let url = `/clinical/domains/${deleteObj.id}/`
            axios.delete(url).then(function (response) {
              if (response.status == config.HTTP_Status.DELETE_SUCCESS) {
                dispatch(PageChange(getState().projectslist.pageNumber, getState().projectslist.pageSize));
                dispatch({ type: HIDE_BANNER })
              }
            })
              .catch((error) => {
                dispatch({
                  type: TOGGLE_NOTIFICATION,
                  payload: true,
                  showTime: 3000,
                  showType: 'error',
                  showMessage: 'ERROR DELETING Cohort'
                })
              })
          }
        })
      }
    })


  }
}

export function PageChange(page, sizePerPage) {
  return (dispatch, getState) => {


    let url = config.api.projects + `?page=${page}&page_size=${sizePerPage}`;
    if (getState().projectslist.searchTerm) {
      url += `&searchParam=${getState().projectslist.searchTerm}`;
    }
    if (getState().projectslist.sortName) {
      url += `&sortName=${getState().projectslist.sortName}&sortOrder=${getState().projectslist.sortOrder}`;
    }
    axios.get(url).then(function (response) {
      if (response.status == config.HTTP_Status.success) {
        dispatch({ type: SET_COHORT_DATA, payload: response.data })
        dispatch({ type: SET_PROP, payload: { key: 'pageSize', value: sizePerPage } })
        dispatch({ type: SET_PROP, payload: { key: 'pageNumber', value: page } })

      }
    })
      .catch((error) => {
        dispatch({
          type: TOGGLE_NOTIFICATION,
          payload: true,
          showTime: 3000,
          showType: 'error',
          showMessage: 'ERROR FETCHING COHORTS'
        })
      })
  }
}

export function fetchCohorts() {
  return (dispatch, getState) => {
    dispatch({ type: TOGGLE_LOADING, payload: true })
    dispatch({ type: SET_PROP, payload: { key: 'pageNumber', value: 1 } })
    axios.get(config.api.projects + `?page=${getState().projectslist.pageNumber}`).then(function (response) {
      if (!response.data || !response.data.results) return;

      dispatch({
        type: SET_COHORT_DATA,
        payload: response.data
      })
    }).catch(function (err) {
        dispatch({ type: TOGGLE_NOTIFICATION, payload: true, showTime: 3000, showType: 'error', showMessage: 'ERROR FETCHING COHORTS' })
    }).then(function(){
      dispatch({ type: TOGGLE_LOADING, payload: false })
    })
  }
}


function _getCohortById(state, id) {
  return state.cohorts.find((u) => {
    if (u.id == parseInt(id)) {
      return u;
    }
  })
}

const ACTION_HANDLERS = {
  [SET_PROP]: (state, action) => {
    return Object.assign({}, state, {
      [action.payload.key]: action.payload.value
    })
  },
  [SET_COHORT_DATA]: (state, action) => {
    let cohorts = []
    if (action.payload.results) {
      action.payload.results.map((ap, i) => {
        let _cohort = {}
        _cohort.name = ap.name
        _cohort.description = ap.description
        _cohort.total = ap.patient_stats.total
        _cohort.inProgress = ap.patient_stats.in_progress
        _cohort.remaining = ap.patient_stats.pending
        _cohort.completed = ap.patient_stats.completed
        _cohort.id = ap.id
        cohorts.push(_cohort)
      })
    }
    return Object.assign({}, state, {
      totalCount: action.payload.count,
      cohorts: cohorts
    })
  }
}

//reducer
const initialState = {
  cohorts: [],
  totalCount: null,
  pageSize: 10,
  pageNumber: 1,
  Page: 1,
  searchTerm: null,
}
export default function loginReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  return handler
    ? handler(state, action)
    : state
}
