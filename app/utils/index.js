
export const searchStateToGA = state => ({
  eventCategory: 'search',
  eventAction: 'click',
  eventLabel: state.query,
  dimension1: state.index,
  dimension2: state.onlyAmazon,
  dimension3: state.node,
  dimension4: state.brand
})

export const colors = {
  Primary: '#FBEF7E',
  Complement: '#515360',
}

export const tagline = 'Amazon Search, But Better'
export const subtagline = 'Find what you\'re searching for faster.'

export const generatePageTitle = q => q ?
  `Best ${q} on Amazon | fivestar` :
  `fivestar | ${tagline}`
