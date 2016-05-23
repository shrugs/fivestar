import React from 'react'
import Product from 'components/Product'

const ProductBucket = ({ items, minPrice }) => (
  <div>
    <div>{`$ ${minPrice / 10} +`}</div>
    <div>
      {items && items.map(item =>
        <Product key={item.ASIN} {...item} />
      )}
    </div>
  </div>
)

export default class ResultsList extends React.Component {

  static propTypes = {
    buckets: React.PropTypes.array
  }

  render() {
    return (
      <div>
        {this.props.buckets && this.props.buckets.map(bucket =>
          <ProductBucket key={bucket.minPrice} {...bucket} />
        )}
      </div>
    )
  }
}
