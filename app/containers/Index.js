import React from 'react'
import { connect } from 'react-redux'
import { IndexLink } from 'react-router'
import Helmet from 'react-helmet'
import Search from 'components/Search'
import ResultsList from 'components/ResultsList'

import { Row, Column } from 'react-foundation'

import {
  ShareButtons,
  generateShareIcon
} from 'react-share'

const {
  FacebookShareButton,
  TwitterShareButton
} = ShareButtons

const FacebookIcon = generateShareIcon('facebook')
const TwitterIcon = generateShareIcon('twitter')

import bannerImage from 'images/banner.png'

import {
  commitParamsToHistory,
  clearResults
} from 'actions'

class Index extends React.Component {
  render() {
    const params = this.props.params

    const pageTitle = params.q ? `Best ${params.q} on Amazon` : 'fivestar | Better Amazon Search'

    const { buckets } = this.props.results
    const hasResults = (buckets && buckets.length > 0)

    return (
      <Row className='display' isColumn>
        <Helmet title={pageTitle} />
        <Row className='banner-image-container'>
          <Column small={10} medium={8} centerOnSmall>
            <IndexLink to='/'>
              <img alt='fivestar logo' src={bannerImage} />
            </IndexLink>
          </Column>
        </Row>
        <Row>
          <Column small={12} medium={10} centerOnMedium>
            <Search
              showFilters={hasResults}
              performSearch={this.props.commitParamsToHistory}
              clearResults={this.props.clearResults}
              params={params}
              // filters={this.props.results.narrowNodes}
            />
            {!this.props.results.buckets &&
              <div className='help-text'>
                <div>Search for a general product and fivestar will find the best one in your price range,</div>
                <div>no comparisons and reading reviews necessary.</div>
              </div>
            }
          </Column>
        </Row>
        <Row>
          <Column small={12} medium={10} centerOnMedium>
            <ResultsList
              buckets={this.props.results.buckets}
              show={this.props.hasSearched}
            />
          </Column>
        </Row>
        <Row>
          <Column small={12} medium={10} centerOnMedium>
            <Row>
              <Column small={hasResults ? 10 : 12} offsetOnSmall={hasResults ? 2 : 0}>
                <div className='share-buttons-container'>
                  <FacebookShareButton
                    url='http://fivestar.io'
                    title='fivestar | A Better Amazon Search'
                  >
                    <FacebookIcon size={32} round />
                  </FacebookShareButton>

                  <TwitterShareButton
                    url='http://fivestar.io'
                    title='fivestar | A Better Amazon Search'
                  >
                    <TwitterIcon size={32} round />
                  </TwitterShareButton>
                </div>
              </Column>
            </Row>
          </Column>
        </Row>
      </Row>
    )
  }

}

export default connect(state => ({
  params: state.routing.locationBeforeTransitions.query,
  results: state.results,
  hasSearched: state.resultsDisplay.show
}), {
  commitParamsToHistory,
  clearResults
})(Index)
