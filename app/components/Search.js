import React from 'react'

import { Row, Column, Button, Switch } from 'react-foundation'

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

  updateParams(params) {
    this.props.updateParams(params)
  }

  render() {
    return (
      <div>
        <Row isColumn>
          <div className='input-group'>
          <input
            type='text'
            className='input-group-field'
            placeholder="'toaster'"
            value={this.props.params.q}
            onChange={e => this.updateParams({ q: e.target.value })}
          />
          <div className='input-group-button'>
            <Button type='submit' onClick={this.submitSearch.bind(this)}>
              Search
            </Button>
          </div>
        </div>
        </Row>
        <Row>
          <Column small={6} medium={3}>
            <Switch onChange={e => this.updateParams({ onlyAmazon: e.target.value })} />
          </Column>
        </Row>
      </div>
    )
  }
}
