import React, { Component } from 'react'
import { Link } from 'react-router'
import { Row, Column } from 'react-foundation'

import ShareButtons from 'components/ShareButtons'
import Logo from 'components/Logo'

const Footer = () => (
  <div className='align-cener footer'>
    <Row isColumn>
      <Column small={12} medium={6}>
        <Row>
          <Logo size={12} alt='alt' />
        </Row>
        <Row isColumn>
          <Link to='/'>Contact</Link>
        </Row>
        <Row isColumn>
          <Link to='/'>About</Link>
        </Row>
        <Row isColumn>
          <Link to='/'>Copyright 2017</Link>
        </Row>
      </Column>
      <Column small={12} medium={6} className='footer-share-buttons-container'>
        <ShareButtons />
      </Column>
    </Row>
  </div>
)

export default Footer
