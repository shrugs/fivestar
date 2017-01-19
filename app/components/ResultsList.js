import React from 'react'
import { Row } from 'react-foundation'

import ResultsSection from 'components/ResultsSection'
import { defaultTopPicks } from 'utils'

import SectionSelect from 'components/SectionSelect'

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

    // @TODO(shrugs) - load these from the server
    const bucketsToRender = (show ? buckets : defaultTopPicks).filter(b => b.items.length > 0)

    return (
      <Row isColumn>
        <SectionSelect buckets={bucketsToRender} onClick={console.log.bind(console)} />
        <Row className='results-list-container' isColumn>
          {bucketsToRender && bucketsToRender.map(bucket =>
            <ResultsSection key={bucket.key} {...bucket} />
          )}
          {(!bucketsToRender || bucketsToRender.length < 1) &&
            <p className='text-center'>No results for <strong>{forQuery}</strong>.</p>
          }
        </Row>
      </Row>
    )
  }
}
