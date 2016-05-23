import React from 'react'

export default class Product extends React.Component {

  static propTypes = {
    ASIN: React.PropTypes.string,
    DetailPageURL: React.PropTypes.string,
    ItemLinks: React.PropTypes.array,
    SalesRank: React.PropTypes.number,
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
        FormattedPrice: React.PropTypes.number
      })
    }),
    OfferSummary: React.PropTypes.shape({
      LowestNewPrice: React.PropTypes.shape({
        FormattedPrice: React.PropTypes.string
      }),
      TotalNew: React.PropTypes.number
    })

  }

  imageSource() {
    const { LargeImage } = this.props
    return LargeImage.URL
  }

  priceDisplay() {
    const { ItemAttributes, OfferSummary } = this.props
    const { ListPrice } = ItemAttributes
    const { LowestNewPrice, TotalNew } = OfferSummary

    return (
      <div>
        <div>{LowestNewPrice.FormattedPrice}</div>
        <div>{`normally ${ListPrice.FormattedPrice}, ${TotalNew} available`}</div>
      </div>
    )
  }

  render() {
    return (
      <div>
        <div>
          {this.priceDisplay()}
          <img alt='product' src={this.imageSource()} />
          <div>
            <h3>{this.props.ItemAttributes.Title}</h3>
            <ul>
              {this.props.ItemAttributes.Feature.map(f =>
                <li key={f}>{f}</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    )
  }
}
