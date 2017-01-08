import React, { Component } from 'react'
import { IndexLink } from 'react-router'
import { Row, Column } from 'react-foundation'

import ShareButtons from 'components/ShareButtons'

import bannerImage from 'images/banner.png'

export default class Navbar extends Component {
  render() {
    return (
      <Row className='navbar align-center'>
        <Column small={12}>
          <Row className='navbar-inner'>
            <Column small={6}>
              <IndexLink to='/'>
                <img className='logo' alt='fivestar logo' src={bannerImage} />
              </IndexLink>
            </Column>
            <div>
              <ShareButtons />
            </div>
          </Row>
        </Column>
      </Row>
    );
  }
}
