import React, { Component } from 'react'
import { Row, Column } from 'react-foundation'
import { connect } from 'react-redux'

import ResultsItem from 'components/ResultsItem'

/*
<Row className='heading-container' isColumn>
  <h3 className='heading'>{heading}</h3>
</Row>
 */

const ResultsSection = ({ heading, items }) => (
  <Row className='results-section' isColumn>
    <Row>
      {items.map(item =>
        <Column key={item.key} small={6} medium={3}>
          <ResultsItem {...item} />
        </Column>
      )}
    </Row>
  </Row>
)

export default ResultsSection
