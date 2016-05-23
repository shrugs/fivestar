import axios from 'axios'

export const NEW_RESULTS = 'NEW_RESULTS'
export function performSearch(params) {
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
