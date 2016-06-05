
// @TODO - get this from react-router when I give a shit
const LOCATION_CHANGE_TYPE = '@@router/LOCATION_CHANGE'

import { performSearch } from 'actions'

export default store => next => action => {
  const result = next(action)
  if (action.type === LOCATION_CHANGE_TYPE) {
    const params = action.payload.query
    next(performSearch(params))
  }

  return result
}
