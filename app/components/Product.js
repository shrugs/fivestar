import React from 'react'
import { Row, Column, Button } from 'react-foundation'

import noImage from 'images/no_image.jpg'

export default class Product extends React.Component {

  static propTypes = {
    ASIN: React.PropTypes.string,
    DetailPageURL: React.PropTypes.string,
    ItemLinks: React.PropTypes.shape({
      ItemLink: React.PropTypes.array
    }),
    SalesRank: React.PropTypes.string,
    SmallImage: React.PropTypes.object,
    MediumImage: React.PropTypes.object,
    LargeImage: React.PropTypes.shape({
      URL: React.PropTypes.string
    }),
    ItemAttributes: React.PropTypes.shape({
      Binding: React.PropTypes.string,
      Brand: React.PropTypes.string,
      Feature: React.PropTypes.array,
      Label: React.PropTypes.string,
      Title: React.PropTypes.string,
      ListPrice: React.PropTypes.shape({
        FormattedPrice: React.PropTypes.string
      })
    }),
    OfferSummary: React.PropTypes.shape({
      LowestNewPrice: React.PropTypes.shape({
        FormattedPrice: React.PropTypes.string
      }),
      TotalNew: React.PropTypes.string
    })

  }

  imageSource() {
    const { LargeImage, MediumImage } = this.props
    if (LargeImage !== undefined) { return LargeImage.URL }
    if (MediumImage !== undefined) { return MediumImage.URL }

    const ImageSets = this.props.ImageSets
    if (ImageSets !== undefined) {
      const { ImageSet } = ImageSets
      if (ImageSet.LargeImage !== undefined) { return ImageSet.LargeImage.URL }
      if (ImageSet.MediumImage !== undefined) { return ImageSet.MediumImage.URL }
    }

    return noImage
  }

  priceDisplay() {
    const { ItemAttributes, OfferSummary } = this.props
    const { ListPrice } = ItemAttributes
    const { LowestNewPrice, TotalNew } = OfferSummary

    return (
      <Row isColumn className='price-display'>
        <Row><h4 className='lowest-new-price'>{LowestNewPrice.FormattedPrice}</h4></Row>
        <Row>
          <p className='num-available'>
            {`normally ${ListPrice.FormattedPrice}, ${TotalNew} available`}
          </p>
        </Row>
      </Row>
    )
  }

  handleViewProduct() {
    window.open(this.props.DetailPageURL, '_blank')
  }

  render() {
    if (this.props.ItemAttributes === undefined || this.props.ItemAttributes.Feature === undefined) {
      return <div></div>
    }
    return (
      <Row isColumn className='product'>
        {this.priceDisplay()}
        <Row isColumn>
          <img alt='product' src={this.imageSource()} />
        </Row>
        <Row isColumn>
          <h3 className='title'>{this.props.ItemAttributes.Title}</h3>
          <ul>
            {this.props.ItemAttributes.Feature.slice(0, 3).map(f =>
              <li key={f}>{f.slice(0, 75) + (f.length > 75 ? '...' : '')}</li>
            )}
            {this.props.ItemAttributes.Feature.length > 3 && <li><a onClick={this.handleViewProduct.bind(this)}>... read more</a></li>}
          </ul>
          <Button isExpanded onClick={this.handleViewProduct.bind(this)}>View on Amazon</Button>
        </Row>
      </Row>
    )
  }
}
