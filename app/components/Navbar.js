import React, { Component } from 'react'
import { IndexLink } from 'react-router'
import { Row, Column } from 'react-foundation'
import { colors, tagline } from 'utils'

import {
  ShareButtons,
  generateShareIcon
} from 'react-share'

const {
  FacebookShareButton,
  TwitterShareButton
} = ShareButtons

const FacebookIcon = generateShareIcon('facebook')
const TwitterIcon = generateShareIcon('twitter')

import bannerImage from 'images/banner.png'

export default class Navbar extends Component {
  render() {
    return (
      <Row className='navbar align-center'>
        <Column small={12} medium={10}>
          <Row className='navbar-inner'>
            <Column small={6}>
              <IndexLink to='/'>
                <img className='logo' alt='fivestar logo' src={bannerImage} />
              </IndexLink>
            </Column>
            <div>
              <div className="share-buttons-container">
                <FacebookShareButton
                  url='http://fivestar.io'
                  title={`fivestar | ${tagline}`}
                >
                  <FacebookIcon
                    size={32}
                    iconBgStyle={{
                      fill: colors.Primary
                    }}
                    logoFillColor={colors.Complement}
                    round
                  />
                </FacebookShareButton>

                <TwitterShareButton
                  url='http://fivestar.io'
                  title={`fivestar | ${tagline}`}
                >
                  <TwitterIcon
                    size={32}
                    iconBgStyle={{
                      fill: colors.Primary
                    }}
                    logoFillColor={colors.Complement}
                    round
                  />
                </TwitterShareButton>
              </div>
            </div>
          </Row>
        </Column>
      </Row>
    );
  }
}
