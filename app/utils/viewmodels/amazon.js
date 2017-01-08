import noImage from 'images/no_image.jpg'

/**
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
 */

const key = item => item.ASIN
const title = item => item.ItemAttributes.Title
const brand = item => item.ItemAttributes.Brand
const detailPageUrl = item => decodeURIComponent(item.DetailPageURL)

function image(item) {
  const {
    LargeImage,
    MediumImage,
    ImageSets
  } = item

  if (LargeImage !== undefined) { return LargeImage.URL }
  if (MediumImage !== undefined) { return MediumImage.URL }

  if (ImageSets !== undefined) {
    const { ImageSet } = ImageSets
    if (ImageSet.LargeImage !== undefined) { return ImageSet.LargeImage.URL }
    if (ImageSet.MediumImage !== undefined) { return ImageSet.MediumImage.URL }
  }

  return noImage
}

function details(item) {
  if (!item.ItemAttributes || !item.ItemAttributes.Feature) { return [] }

  return item.ItemAttributes.Feature.slice(0, 4).map(f => f.slice(0, 75) + (f.length > 75 ? '...' : ''))
}

function formattedPrice(item) {
  const { ItemAttributes, OfferSummary } = item
  const { ListPrice } = ItemAttributes
  const { LowestNewPrice } = OfferSummary

  return ListPrice ? ListPrice.FormattedPrice : LowestNewPrice.FormattedPrice
}

/**
 * Converts amazon-specific models into platform-independent view descriptions.
 */
export default buckets => (
  buckets.map(b => ({
    key: b.minPrice,
    heading: `$ ${b.minPrice / 100} +`,
    items: b.items.map(item => ({
      key: key(item),
      title: title(item),
      brand: brand(item),
      detailPageUrl: detailPageUrl(item),
      image: image(item),
      details: details(item),
      formattedPrice: formattedPrice(item)
    }))
  }))
)
