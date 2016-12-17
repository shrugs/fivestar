import React from 'react'
import { Link } from 'react-router'
import {
  Row, Column,
  Button, Colors
} from 'react-foundation'

const ProductLink = ({ slug, children }) => (
  <Link to={{ query: { query: slug } }}>
    <Button
      color={Colors.PRIMARY}
      onClick={() => {
        if (window.ga) {
          window.ga('send', 'event', {
            eventCategory: 'recommended',
            eventAction: 'click',
            eventLabel: slug
          })
        }
      }}
      isExpanded
    >
      {children}
    </Button>
  </Link>
)

const ExampleSearchList = () => (
  <div>
    <Row>
      <Column small={12}>
        <h4>Lots of people are looking for the best</h4>
      </Column>
    </Row>
    <Row>
      <Column small={12} medium={6}>
        <ProductLink slug='headphones'>Headphones</ProductLink>
      </Column>
      <Column small={12} medium={6}>
        <ProductLink slug='in-ear monitors'>In-Ear Monitors</ProductLink>
      </Column>
      <Column small={12} medium={6}>
        <ProductLink slug='noise cancelling headphones'>Noise Cancelling Headphones</ProductLink>
      </Column>
      <Column small={12} medium={6}>
        <ProductLink slug='school laptop'>School Laptop</ProductLink>
      </Column>
      <Column small={12} medium={6}>
        <ProductLink slug='pocket knife'>Pocket Knife</ProductLink>
      </Column>
      <Column small={12} medium={6}>
        <ProductLink slug='gaming mouse'>Gaming Mouse</ProductLink>
      </Column>
      <Column small={12} medium={6}>
        <ProductLink slug='gaming headphones'>Gaming Headphones</ProductLink>
      </Column>
    </Row>
  </div>
)

export default ExampleSearchList
