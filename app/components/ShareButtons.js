import React, { Component } from 'react'
import { tagline, colors } from 'utils'

import {
  ShareButtons as OGShareButtons,
  generateShareIcon
} from 'react-share'

const {
  FacebookShareButton,
  TwitterShareButton
} = OGShareButtons

const FacebookIcon = generateShareIcon('facebook')
const TwitterIcon = generateShareIcon('twitter')

const ShareButtons = () => (
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
)

export default ShareButtons
