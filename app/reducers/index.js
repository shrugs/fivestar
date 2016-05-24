import { routerReducer as routing } from 'react-router-redux'
import { combineReducers } from 'redux'
import {
  MIRROR_PARAMS,
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

function paramsReducer(state = { q: '' }, action) {
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

const rootReducer = combineReducers({
  params: paramsReducer,
  results: resultsReducer,
  routing
})

export default rootReducer
