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
      <Row isColumn>
        <div
          className='results-item'
          style={{ backgroundImage: `url(${this.props.image})` }}
          onClick={this.handleViewProduct.bind(this)}
        >
          <div className='price-display-container'>
            <h4 className='price-display'><b>{this.props.formattedPrice}</b> {this.props.title}</h4>
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

export default connect(null, {
  showResultDetails
})(ResultsItem)
