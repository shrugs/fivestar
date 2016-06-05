import React from 'react'
import { connect } from 'react-redux'

class App extends React.Component {
  render() {
    return (
      <div>{this.props.children}</div>
    )
  }
}

export default connect(state => ({

}), {
})(App)
