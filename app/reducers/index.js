import NProgress from 'react-nprogress'

import { routerReducer as routing } from 'react-router-redux'
import { combineReducers } from 'redux'
import {
  MIRROR_PARAMS,
  BEGIN_SEARCH,
  NEW_RESULTS,
  CLEAR_RESULTS
} from '../actions'

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
  }

  return state
}

const rootReducer = combineReducers({
  params: paramsReducer,
  results: resultsReducer,
  loading: loadingReducer,
  routing
})

export default rootReducer
