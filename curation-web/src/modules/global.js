import axios from '../lib/axios'
import immutable from 'immutable'
import { fromJS } from 'immutable'
import { push } from 'react-router-redux'
import config from '../config'

export const USER_LOG_IN = 'USER_LOG_IN'
export const USERNAME_CHANGED = 'USERNAME_CHANGED'
export const USER_LOGGING_OUT = 'USER_LOGGING_OUT'
export const TOGGLE_NOTIFICATION = 'TOGGLE_NOTIFICATION'
export const HIDE_BANNER = 'HIDE_BANNER'
export const TOGGLE_LOGGEDIN_ROLE = 'TOGGLE_LOGGEDIN_ROLE'
export const TOGGLE_LOADING = 'TOGGLE_LOADING'
export const USER_ROLE = 'USER_ROLE'
export const AUTH_TOKEN = 'AUTH_TOKEN'
export const USER_FIRST_NAME = 'USER_FIRST_NAME'

export function Logout() {
    return (dispatch) => {
        axios.get(config.api.user_logout).then(function(response){
            dispatch({ type: USER_LOGGING_OUT });
            localStorage.removeItem('access_token');
            localStorage.removeItem('logged_user');
            localStorage.removeItem('access_token');
            localStorage.removeItem('logged_user_role');
            localStorage.removeItem('logged_user_first_name');
            window.location.href = '/login';
        }).catch(function(err){
            
        })        
    }
}

export function ValidateUserToken() {
    return (dispatch) => {
        const token = localStorage.getItem('access_token')
        const username = localStorage.getItem('logged_user')
        const role = localStorage.getItem('logged_user_role')
        const userFirstName = localStorage.getItem('logged_user_first_name');
        if (token && username) {
            dispatch({ type: USER_LOG_IN, payload: true })
            dispatch({ type: USERNAME_CHANGED, payload: username })
            dispatch({ type: USER_ROLE, payload: role })
            dispatch({ type: USER_FIRST_NAME, payload: userFirstName })
            return true;
        }
        return false;
    }
}

export function HideBanner() {
    return (dispatch) => {
        dispatch({
            type: HIDE_BANNER
        })
    }
}

const ACTION_HANDLERS = {
    [USER_LOG_IN]: (state, action) => state.set('isAuthenticated', action.payload),
    [AUTH_TOKEN]: (state, action) => state.set('authToken', action.payload),
    [USER_ROLE]: (state, action) => state.set('role', action.payload),
    [USER_FIRST_NAME]: (state, action) => state.set('userFirstName', action.payload),
    [USERNAME_CHANGED]: (state, action) => state.set('emailid', action.payload),
    [USER_LOGGING_OUT]: (state, action) => state
        .set('isAuthenticated', false).set('authToken', null)
        .set('showBanner', false),
    [HIDE_BANNER]: (state, action) => state.set('showBanner', false),
    [TOGGLE_NOTIFICATION]: (state, action) => {
        window.scrollTo(0,0);
        return state.set('showBanner', false).set('showTime', 0).set('showTime', action.showTime)
        .set('showType', action.showType)
        .set('showMessage', action.showMessage)
        .set('showBanner', true)
        .set('messageTitle', action.messageTitle)
        .set('successCb', action.successCb)
        .set('confirmText', action.confirmText)},
    [TOGGLE_LOGGEDIN_ROLE]: (state, action) => state.set('role', action.payload),
    [TOGGLE_LOADING]: (state, action) =>state.set('isLoading',action.payload)
}

const initialState = fromJS({ isAuthenticated: false, emailid: null, password: null, role: null, isLoading: false, userFirstName: null, authToken: null })

export default function globalReducer(state = initialState, action) {
    const handler = ACTION_HANDLERS[action.type];
    return handler
        ? handler(state, action)
        : state;
}
