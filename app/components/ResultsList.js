import React from 'react'
import { Row, Column } from 'react-foundation'
import Product from 'components/Product'

const ProductBucket = ({ items, minPrice }) => (
  <Row className='product-bucket'>
    <Column small={2} className='bucket-price'>
      <h4>{`$ ${minPrice / 100} +`}</h4>
    </Column>
    <Column small={10}>
      <Row>
        {items && items.map(item =>
          <Column key={item.ASIN} small={6}>
            <Product {...item} />
          </Column>
        )}
      </Row>
    </Column>
  </Row>
)

export default class ResultsList extends React.Component {

  static propTypes = {
    buckets: React.PropTypes.array
  }

  render() {
    return (
      <div className='results-list-container'>
        {this.props.buckets && this.props.buckets.filter(b => b.items.length > 0).map(bucket =>
          <ProductBucket key={bucket.minPrice} {...bucket} />
        )}
      </div>
    )
  }
}
