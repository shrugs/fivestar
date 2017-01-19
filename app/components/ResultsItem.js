import React from 'react'
import { connect } from 'react-redux'
import { Row, Column, Button, Colors } from 'react-foundation'
import {
  showResultDetails
} from 'actions/ModalActions'

class ResultsItem extends React.Component {

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
      <div
        className='results-item'
        onClick={this.handleViewProduct.bind(this)}
      >
        <div
          className='product-image'
          style={{ backgroundImage: `url(${this.props.image})` }}
        >
          <div className='price-display-container'>
            <h4 className='price-display'><b>{this.props.formattedPrice}</b></h4>
          </div>
        </div>
        <div className='product-info'>
          <h3>{this.props.title}</h3>
          <p>by {this.props.brand}</p>
        </div>
      </div>
    )
  }
}

export default connect(null, {
  showResultDetails
})(ResultsItem)
