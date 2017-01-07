import React from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import Search from 'containers/Search'
import ResultsList from 'components/ResultsList'
import Navbar from 'components/Navbar'

import { Row, Column } from 'react-foundation'

import { generatePageTitle } from 'utils'

class Index extends React.Component {
  render() {
    const {
      params,
      results,
      showResults
    } = this.props

    const {
      buckets
    } = results

    const pageTitle = generatePageTitle(params.q)

    const hasResults = (buckets && buckets.length > 0)

    return (
      <Row className='display' isColumn>
        <Helmet title={pageTitle} />
        <Navbar />
        <Row>
          <Column small={12} medium={10} centerOnMedium>
            <Search
              showFilters={hasResults}
              performSearch={this.props.commitParamsToHistory}
              clearResults={this.props.clearResults}
              params={params}
              // filters={this.props.results.narrowNodes}
            />
          </Column>
        </Row>
        <Row>
          <Column small={12} medium={10} centerOnMedium>
            <ResultsList
              buckets={buckets}
              show={showResults}
              forQuery={params.q}
            />
          </Column>
        </Row>
      </Row>
    )
  }

}

export default connect(state => ({
  params: state.routing.locationBeforeTransitions.query,
  results: state.results,
  showResults: state.resultsDisplay.show
}), null)(Index)
