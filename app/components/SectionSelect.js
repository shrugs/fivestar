import React, { Component } from 'react';

import { Row, Column, Button } from 'react-foundation'

const SectionSelect = ({ buckets, onClick }) => (
  <Row>
    <Column>
      <Button onClick={() => onClick('all')}>
        All Prices
      </Button>
    </Column>
    {buckets.map(bucket =>
      <Column key={bucket.key}>
        <Button onClick={() => onClick(bucket.key)}>
          {bucket.heading}
        </Button>
      </Column>
    )}
  </Row>
)

export default SectionSelect
