// @TODO(shrugs) - refactor this into a more generic component,
//   removing all of the amazon-specific nonsense
// Create a viewmodel (server-side?) to map from amazon's response product to this new model

import React from 'react'
import { Row, Column, Button, Colors } from 'react-foundation'

export default class ResultsItem extends React.Component {

  static propTypes = {
    title: React.PropTypes.string,
    brand: React.PropTypes.string,
    detailPageUrl: React.PropTypes.string,
    image: React.PropTypes.string,
    details: React.PropTypes.arrayOf(React.PropTypes.string),
    formattedPrice: React.PropTypes.string,
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
      <Row isColumn>
        <div className='results-item' style={{ backgroundImage: `url(${this.props.image})` }}>
          <div className='price-display-container'>
            <h4 className='price-display'>{this.props.formattedPrice}</h4>
          </div>
          <Button
            color={Colors.PRIMARY}
            onClick={this.handleViewProduct.bind(this)}
            className='view-button'
            isExpanded
          >
            View
          </Button>
        </div>
      </Row>
    )
  }
}
