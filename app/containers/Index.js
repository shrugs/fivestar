import React from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import Search from 'components/Search'
import ResultsList from 'components/ResultsList'

import { Row, Column } from 'react-foundation';

import bannerImage from 'images/banner.png'

import {
  updateParams,
  performSearch,
  historyCheckpoint
} from 'actions'

class Index extends React.Component {

  render() {
    const params = this.props.params

    const pageTitle = params.q ? `Best ${params.q} on Amazon` : 'fivestar | Better Amazon Search'
    return (
      <Row className='display' isColumn>
        <Helmet title={pageTitle} />
        <Row>
          <Column small={8} centerOnSmall>
            <img alt='fivestar logo' src={bannerImage} />
          </Column>
        </Row>
        <Row>
          <Column small={12} medium={10} centerOnMedium>
            <Search
              updateParams={this.props.updateParams}
              performSearch={this.props.performSearch}
              params={params}
              filters={this.props.filters}
            />
          </Column>
        </Row>
        <Row>
          <Column small={12} medium={10} centerOnMedium>
            <ResultsList buckets={this.props.results.buckets} />
           </Column>
        </Row>
      </Row>
    )
  }

}

export default connect(state => ({
  params: state.params,
  results: state.results,
  filters: state.filters
}), {
  performSearch,
  updateParams
})(Index)
