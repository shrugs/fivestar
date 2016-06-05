import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import createLogger from 'redux-logger'
import rootReducer from '../reducers'
import searchOnLocationChange from '../middleware/searchOnLocationChange'

import { browserHistory } from 'react-router'
import { routerMiddleware } from 'react-router-redux'

const logger = createLogger()
const routerMiddlewareInstance = routerMiddleware(browserHistory)

export default function configureStore(initialState) {
  return createStore(
    rootReducer,
    initialState,
    __DEV__ ?
      applyMiddleware(searchOnLocationChange, thunk, routerMiddlewareInstance, logger) :
      applyMiddleware(searchOnLocationChange, thunk, routerMiddlewareInstance)
  )
}
