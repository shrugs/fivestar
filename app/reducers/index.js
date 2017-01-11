import NProgress from 'react-nprogress'

import { routerReducer as routing } from 'react-router-redux'
import { combineReducers } from 'redux'
import {
  MIRROR_PARAMS,
  BEGIN_SEARCH,
  NEW_RESULTS,
  CLEAR_RESULTS
} from '../actions'

import modalReducer from './modalReducer'

function resultsReducer(state = [], action) {
  switch (action.type) {
    case NEW_RESULTS:
      return action.results
    case CLEAR_RESULTS:
      return []
    default:
      return state
  }
}

function resultsDisplayReducer(state = { show: false }, action) {
  switch (action.type) {
    case NEW_RESULTS:
      return { show: true }
    case CLEAR_RESULTS:
      return { show: false }
    default:
      return state
  }
}

function paramsReducer(state = { query: '' }, action) {
  switch (action.type) {
    case MIRROR_PARAMS:
      return {
        ...state,
        ...action.params
      }

    default:
      return state
  }
}

function loadingReducer(state = { loading: false }, action) {
  switch (action.type) {
    case BEGIN_SEARCH:
      NProgress.start()
      return { loading: true }
    case CLEAR_RESULTS:
    case NEW_RESULTS:
      NProgress.done()
      return { loading: false }
    default:
      return state
  }
}

const rootReducer = combineReducers({
  params: paramsReducer,
  results: resultsReducer,
  loading: loadingReducer,
  resultsDisplay: resultsDisplayReducer,
  modal: modalReducer,
  routing
})

export default rootReducer
