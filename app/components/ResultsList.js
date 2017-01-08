import React from 'react'
import { Row, Column } from 'react-foundation'
import ResultsItem from 'components/ResultsItem'
import ExampleSearchList from 'components/ExampleSearchList'

// @TODO(shrugs) - replace ProductBucket with ResultsSection
const ProductBucket = ({ items, header }) => (
  <Row className='product-bucket'>
    <Column small={2} className='bucket-price'>
      <h4>{header}</h4>
    </Column>
    <Column small={10}>
      <Row>
        {items && items.map(item =>
          <Column key={item.key} small={12} medium={6}>
            <ResultsItem {...item} />
          </Column>
        )}
      </Row>
    </Column>
  </Row>
)

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
      <div className='results-list-container'>
        {buckets && buckets.filter(b => b.items.length > 0).map(bucket =>
          <ProductBucket key={bucket.key} {...bucket} />
        )}
        {(!buckets || buckets.length < 1) &&
          <p className='text-center'>No results for <strong>{forQuery}</strong>.</p>
        }
      </div>
    )
  }
}
