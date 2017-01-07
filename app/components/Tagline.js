import React, { Component } from 'react'
import { Row, Column } from 'react-foundation'

import { tagline, subtagline } from 'utils'

const Tagline = () => (
  <Row className='tagline-container' isColumn>
    <h2 className='tagline'>{tagline}</h2>
    <p className='subtagline'>{subtagline}</p>
  </Row>
)

export default Tagline
