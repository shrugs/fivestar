import React, { Component } from 'react'
import { connect } from 'react-redux'

export class ResultsSection extends Component {
  static propTypes = {
    heading: React.PropTypes.string,
    items: React.PropTypes.array,
  }

  render() {
    return (
      <Row isColumn>
        <Row isColumn>
          <h3>{heading}</h3>
        </Row>
        <Row>
          {items.map(i =>
            <div>Item</div>
          )}
        </Row>
      </Row>
    );
  }
}

// @TODO(shrugs) - action for showing item modal here
export defualt connect(null, null)(ResultsSection)
