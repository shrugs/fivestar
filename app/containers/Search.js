import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Row, Column } from 'react-foundation'

import SearchBar from 'components/SearchBar'
import Tagline from 'components/Tagline'

import {
  commitParamsToHistory,
  clearResults
} from 'actions'

export class Search extends Component {
  render() {
    return (
      <Row isColumn>
        <Tagline />

        <SearchBar {...this.props} />
      </Row>
    );
  }
}

export default connect(state => ({
  params: state.routing.locationBeforeTransitions.query,
  results: state.results,
}), {
  performSearch: commitParamsToHistory,
  clearResults
})(Search)
