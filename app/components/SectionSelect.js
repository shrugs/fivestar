import React, { Component } from 'react';

import { Row, Column, Button } from 'react-foundation'

const SectionSelectButton = ({ onClick, color, children, active }) => (
  <Button className={`section-select ${active ? 'active' : ''}`} onClick={onClick} isExpanded>
    {children}
  </Button>
)

const SectionSelect = ({ buckets, onClick, active }) => (
  <Row className='section-select-container small-12 medium-11'>
    {buckets.map(bucket =>
      <Column key={bucket.key} className='align-middle'>
        <SectionSelectButton
          onClick={() => onClick(bucket.key)}
          active={active === bucket.key}
        >
          {bucket.heading}
        </SectionSelectButton>
      </Column>
    )}
  </Row>
)

export default SectionSelect
