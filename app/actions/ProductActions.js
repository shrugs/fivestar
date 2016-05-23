export const PERFORM_SEARCH = 'PERFORM_SEARCH'

export function performSearch(params) {
  return dispatch => {
    dispatch({
      type: PERFORM_SEARCH,
      results: [{ name: 'test' }]
    })
  }
}
