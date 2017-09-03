import { combineReducers } from 'redux'
import locationReducer from './location'
import { routerReducer as router } from 'react-router-redux';
import {globalReducer} from '../modules';
export const makeRootReducer = (asyncReducers) => {
  return combineReducers({
    router,
    global: globalReducer,
    location: locationReducer,
    ...asyncReducers
  })
}

export const injectReducer = (store, { key, reducer }) => {
  if (Object.hasOwnProperty.call(store.asyncReducers, key)) return

  store.asyncReducers[key] = reducer
  store.replaceReducer(makeRootReducer(store.asyncReducers))
}

export default makeRootReducer
