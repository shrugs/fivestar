import React from 'react'
import { Row } from 'react-foundation'
import _ from 'lodash'

import ResultsSection from 'components/ResultsSection'
import { defaultTopPicks } from 'utils'

import SectionSelect from 'components/SectionSelect'

export default class ResultsList extends React.Component {

  static propTypes = {
    buckets: React.PropTypes.array,
    show: React.PropTypes.bool,
    forQuery: React.PropTypes.string
  }

  constructor(props) {
    super(props)

    this.state = {
      active: props.show ? 'all-prices' : 'top-picks'
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      active: nextProps.show ? 'all-prices' : 'top-picks'
    })
  }

  newActiveTab(key) {
    this.setState({
      active: key
    })
  }

  render() {
    const {
      buckets,
      show,
      forQuery
    } = this.props

    // @TODO(shrugs) - load these from the server
    var bucketsAvailable = (show ? buckets : defaultTopPicks).filter(b => b.items.length > 0)

    if (show && bucketsAvailable.length === 0) {
      return (
        <Row isColumn>
          <p className='text-center'>No results for <strong>{forQuery}</strong>.</p>
        </Row>
      )
    }

    var bucketsToRender = bucketsAvailable

    // if we have valid results
    if (show) {
      bucketsAvailable.unshift({
        key: 'all-prices',
        heading: 'All Prices',
        items: _.flatten(bucketsAvailable.map(bucket => bucket.items))
      })

      // if the active key is `all`, we want to reduce all of the buckets to a single bucket
      bucketsToRender = _.compact([_.find(bucketsAvailable, { key: this.state.active })])
    }

    return (
      <Row isColumn>
        <SectionSelect
          active={this.state.active}
          buckets={bucketsAvailable}
          onClick={this.newActiveTab.bind(this)}
        />
        <Row className='results-list-container' isColumn>
          {bucketsToRender && bucketsToRender.map(bucket =>
            <ResultsSection key={bucket.key} {...bucket} />
          )}
        </Row>
      </Row>
    )
  }
}
