import React from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import Search from 'components/Search'
import ResultsList from 'components/ResultsList'

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
      <div>
        <Helmet title={pageTitle} />
        <img alt='fivestar logo' src={bannerImage} />
        <Search
          updateParams={this.props.updateParams}
          performSearch={this.props.performSearch}
          params={params}
          filters={this.props.filters}
        />
        <ResultsList buckets={this.props.results.buckets} />
      </div>
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
