import React, { Component } from 'react'
import { Row, Column } from 'react-foundation'
import { Link, IndexLink } from 'react-router'

import ShareButtons from 'components/ShareButtons'
import bannerImage from 'images/banner.png'

const Footer = () => (
  <Row className='align-cener footer'>
    <Column small={12} medium={6}>
      <Row isColumn>
        <IndexLink to='/'>
          <img className='logo' alt='fivestar logo' src={bannerImage} />
        </IndexLink>
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
)

export default Footer
