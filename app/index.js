import React from 'react'
import { render } from 'react-dom'
import { browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import Root from 'containers/Root'
import configureStore from 'reducers/configure-store'

import 'styles/main.scss'
import 'styles/nprogress.css'

const store = configureStore()
const history = syncHistoryWithStore(browserHistory, store)

render(
  // Use React.createElement to avoid issues with JSX in entry point
  React.createElement(Root, { store, history }),
  document.getElementById('root')
)
