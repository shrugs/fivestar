import React from 'react'

import {
  historyCheckpoint
} from 'actions'

export default class Search extends React.Component {

  static propTypes = {
    params: React.PropTypes.shape({
      q: React.PropTypes.string,
      index: React.PropTypes.string,
      node: React.PropTypes.string,
      brand: React.PropTypes.string,
      onlyAmazon: React.PropTypes.bool
    }),

    filters: React.PropTypes.object
  }

  submitSearch() {
    historyCheckpoint({
      query: this.props.params
    })
    this.props.performSearch(this.props.params)
  }

  handleSearchChange(e) {
    this.props.updateParams({
      q: e.target.value
    })
  }

  render() {
    return (
      <div>
        <input
          type='text'
          placeholder="'toaster'"
          value={this.props.params.q}
          onChange={this.handleSearchChange.bind(this)}
        />
        <button type='submit' onClick={this.submitSearch.bind(this)}>
          Search
        </button>
      </div>
    )
  }
}
