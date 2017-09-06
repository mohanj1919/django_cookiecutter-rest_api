import axios from '../../../lib/axios'
import {HIDE_BANNER, TOGGLE_NOTIFICATION, TOGGLE_LOADING} from '../../../modules/global.js';

const ACTION_HANDLERS = {
 
}
const initialState = {
}
export default function caseReportFormsReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler
    ? handler(state, action)
    : state
}