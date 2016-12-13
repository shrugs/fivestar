
export const searchStateToGA = state => ({
  eventCategory: 'search',
  eventAction: 'click',
  eventLabel: state.query,
  dimension1: state.index,
  dimension2: state.onlyAmazon,
  dimension3: state.node,
  dimension4: state.brand
})
