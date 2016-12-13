
// @TODO - get this from react-router when I give a shit
const LOCATION_CHANGE_TYPE = '@@router/LOCATION_CHANGE'

export default store => next => action => {
  const result = next(action)
  if (action.type === LOCATION_CHANGE_TYPE) {
    if (window.ga) {
      window.ga('send', 'pageview')
    }
  }

  return result
}
