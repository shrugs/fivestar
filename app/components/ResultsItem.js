// @TODO(shrugs) - refactor this into a more generic component,
//   removing all of the amazon-specific nonsense
// Create a viewmodel (server-side?) to map from amazon's response product to this new model

import React from 'react'
import { Row, Column, Button } from 'react-foundation'

export default class ResultsItem extends React.Component {

  static propTypes = {
    title: React.PropTypes.string,
    brand: React.PropTypes.string,
    detailPageUrl: React.PropTypes.string,
    image: React.PropTypes.string,
    details: React.PropTypes.arrayOf(React.PropTypes.string),
    formattedPrice: React.PropTypes.string,
  }

  priceDisplay() {
    return (
      <Row isColumn className='price-display'>
        <Row isColumn><h4 className='lowest-new-price'>{this.props.formattedPrice}</h4></Row>
      </Row>
    )
  }

  handleViewProduct() {
    const url = this.props.detailPageUrl

    if (window.ga) {
      window.ga('send', 'event', 'amazon', 'clickthrough', url)
    }

    window.open(url, '_blank')
  }

  render() {
    return (
      <Row isColumn className='product'>
        {this.priceDisplay()}
        <Row isColumn>
          <img alt='product' src={this.props.image} />
        </Row>
        <Row isColumn>
          <h3 className='title'>{this.props.title}</h3>
          <ul>
            {this.props.details.map(d =>
              <li key={d}>{d}</li>
            )}
          </ul>
          <Button isExpanded onClick={this.handleViewProduct.bind(this)}>View</Button>
        </Row>
      </Row>
    )
  }
}
