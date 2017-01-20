import React, { Component } from 'react'
import { Row, Column } from 'react-foundation'

import ShareButtons from 'components/ShareButtons'

import Logo from 'components/Logo'

export default class Navbar extends Component {
  render() {
    return (
      <Row className='navbar'>
        <Column small={12} medium={10} className='medium-centered'>
          <Row isColumn>
            <div className='navbar-inner align-center'>
              <Logo size={6} />
              <div>
                <ShareButtons />
              </div>
            </div>
          </Row>
        </Column>
      </Row>
    );
  }
}
