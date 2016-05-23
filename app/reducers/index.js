import { routerReducer as routing } from 'react-router-redux'
import { combineReducers } from 'redux'
// import { SAY_HELLO } from '../actions'

function helloWorld(state = {}, action) {
  // switch (action.type) {
  //   case SAY_HELLO:
  //     return {
  //       ...state,
  //       name: action.name
  //     }
  //   default:
  //     return state
  // }
  return state
}

const rootReducer = combineReducers({
  helloWorld,
  routing
})

export default rootReducer
