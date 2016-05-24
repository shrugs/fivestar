import axios from 'axios'

import { historyCheckpoint } from 'actions/UrlActions'

export const NEW_RESULTS = 'NEW_RESULTS'
export function performSearch(params) {
  historyCheckpoint({query: params})
  return dispatch => {
    axios({
      method: 'GET',
      url: '/api/search',
      params: params
    })
    .then(resp => resp.data)
    .then(results => {
      dispatch({
        type: NEW_RESULTS,
        results
      })
    })
  }
}

export const CLEAR_RESULTS = 'CLEAR_RESULTS'
export function clearResults() {
  {
    type: CLEAR_RESULTS
  }
}