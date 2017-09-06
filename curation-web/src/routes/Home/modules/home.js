import axios from '../../../lib/axios'
import { HIDE_BANNER, TOGGLE_NOTIFICATION, TOGGLE_LOADING } from '../../../modules/global.js';

const LOAD_PROJECTS = 'LOAD_PROJECTS'
const SET_PROPS = 'SET_PROPS'

export function PasswordExpirationCheck() {
  return (dispatch) => {
    let password_expiry_on = localStorage.getItem('password_expiry_on')
    if (password_expiry_on) {
      let passwordExpiraryDate = new Date(password_expiry_on);
      let today = new Date();
      let timeDiff = Math.abs(today.getTime() - passwordExpiraryDate.getTime());
      let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      if (diffDays <= 10) {
        dispatch({
          type: TOGGLE_NOTIFICATION,
          showBanner: true,
          showTime: null,
          showType: 'warning',
          showMessage: `Your password will expire in ${diffDays} day(s)`
        })
      }
    }
  }
}
export function GetCuratorProjects() {
  return (dispatch, getState) => {
    let page = getState().home.page ? getState().home.page : 1
    let sizePerPage = getState().home.sizePerPage ? getState().home.sizePerPage : 10
    dispatch({ type: SET_PROPS, payload: { key: 'page', value: page } })
    dispatch({ type: SET_PROPS, payload: { key: 'sizePerPage', value: sizePerPage } })

    let getUrl = getState().home.searchParam
      ? `/clinical/projectcohorts/?page=${getState().home.page}&page_size=${getState().home.sizePerPage}&searchParam=${getState().home.searchParam}` :
      `/clinical/projectcohorts/?page=${getState().home.page}&page_size=${getState().home.sizePerPage}`
    if (getState().home.sortName) {
      getUrl += `&sortName=${getState().home.sortName}&sortOrder=${getState().home.sortOrder}`;
    }
    dispatch({ type: TOGGLE_LOADING, payload: true })
    axios.get(getUrl)
      .then(function (response) {
        dispatch({
          type: LOAD_PROJECTS,
          payload: response.data
        })
      })
      .catch(function (errors) {
        dispatch({
          type: TOGGLE_NOTIFICATION,
          showBanner: true,
          showTime: 3000,
          showType: 'error',
          showMessage: 'Failed loading Projects'
        })
      }).then(function(){
        dispatch({ type: TOGGLE_LOADING, payload: false })
      })
  }
}
export function PageChanged(page, sizePerPage) {
  return (dispatch) => {
    dispatch({ type: SET_PROPS, payload: { key: 'page', value: page ? page : 1 } })
    dispatch({ type: SET_PROPS, payload: { key: 'sizePerPage', value: sizePerPage } })
    dispatch(GetCuratorProjects())
  }
}

export function SearchProject(event) {
  return (dispatch) => {
    dispatch({ type: SET_PROPS, payload: { key: 'searchParam', value: event.target.value } })
    dispatch(GetCuratorProjects())
  }
}

export function SortChange(sortName, sortOrder) {
  return (dispatch) => {
    dispatch({ type: SET_PROPS, payload: { key: 'sortName', value: sortName } })
    dispatch({ type: SET_PROPS, payload: { key: 'sortOrder', value: sortOrder } })
    dispatch(GetCuratorProjects())
  }
}

const ACTION_HANDLERS = {
  [SET_PROPS]: (state, action) => {
    return Object.assign({}, state, { [action.payload.key]: action.payload.value })
  },
  [LOAD_PROJECTS]: (state, action) => {
    if (action.payload && action.payload.results) {
      let projects = []
      action.payload.results.map((ap, i) => {

        if (ap.cohort) {
          let cohortData = {
            id: ap.cohort.id,
            name: ap.cohort.name,
            description: ap.cohort.description,
            totalPatients: ap.patient_stats ? ap.patient_stats.total : 0,
            completedPatients: ap.patient_stats ? ap.patient_stats.completed : 0,
            inProgressPatients: ap.patient_stats ? ap.patient_stats.in_progress : 0,
            project_id: ap.project.id,
            project_name: ap.project.name,
            project_description: ap.project.description,
            has_pending_patients: ap.patient_stats ? ap.patient_stats.has_pending_patients : false
          }
          projects.push(cohortData)
        }
      })
      return Object.assign({}, state, { projectsData: projects, totalCount: action.payload.count })
    }
    return Object.assign({}, state)
  }
}

//reducer
const initialState = {
  projectsData: null,
}
export default function homeReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
