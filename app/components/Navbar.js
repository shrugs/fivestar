import React, { Component } from 'react'
import { Row, Column } from 'react-foundation'

import ShareButtons from 'components/ShareButtons'

import Logo from 'components/Logo'

export default class Navbar extends Component {
  render() {
    return (
      <Row className='navbar align-center'>
        <Column small={12}>
          <Row className='navbar-inner'>
            <Logo size={6} />
            <div>
              <ShareButtons />
            </div>
          </Row>
        </Column>
      </Row>
    );
  }
}
