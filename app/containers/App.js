import React from 'react'
import { connect } from 'react-redux'

import Navbar from 'components/Navbar'
import Footer from 'components/Footer'

class App extends React.Component {
  render() {
    return (
      <div>
        <Navbar />
        {this.props.children}
        <Footer />
      </div>
    )
  }
}

export default connect(state => ({

}), {
})(App)
