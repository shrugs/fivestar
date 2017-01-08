import React from 'react'
import { Row } from 'react-foundation'

import ResultsSection from 'components/ResultsSection'
import ExampleSearchList from 'components/ExampleSearchList'

export default class ResultsList extends React.Component {

  static propTypes = {
    buckets: React.PropTypes.array,
    show: React.PropTypes.bool,
    forQuery: React.PropTypes.string
  }

  render() {
    const {
      buckets,
      show,
      forQuery
    } = this.props

    if (!show) {
      // If we don't want to show the results list,
      // show some top picks instead.
      return (
        <div className='results-list-container'>
          <ExampleSearchList />
        </div>
      )
    }


    return (
      <Row className='results-list-container' isColumn>
        {buckets && buckets.filter(b => b.items.length > 0).map(bucket =>
          <ResultsSection key={bucket.key} {...bucket} />
        )}
        {(!buckets || buckets.length < 1) &&
          <p className='text-center'>No results for <strong>{forQuery}</strong>.</p>
        }
      </Row>
    )
  }
}
