import React, { Component } from 'react'
import { IndexLink } from 'react-router'
import { Column } from 'react-foundation'
import RetinaImage from 'react-retina-image'
import primaryLogo from 'images/fivestar_logo_black.png'
import primaryLogo2 from 'images/fivestar_logo_black_2x.png'
import altLogo from 'images/fivestar_logo_yellow.png'
import altLogo2 from 'images/fivestar_logo_yellow_2x.png'

const logoMap = {
  primary: [primaryLogo, primaryLogo2],
  alt: [altLogo, altLogo2]
}

const Logo = ({ size = 12, alt = 'primary' }) => (
  <Column small={size} className='logo-wrapper'>
    <IndexLink to='/'>
      <RetinaImage
        className='logo'
        alt='fivestar logo'
        src={logoMap[alt]}
        checkIfRetinaImgExists={false}
      />
    </IndexLink>
  </Column>
)

export default Logo
