const _ = require('lodash')
const cache = require('memory-cache')

exports.validSortCriteria = {
  All: {sort: '', shouldBracket: true},
  Appliances: {sort: 'relevancerank', shouldBracket: true},
  MobileApps: {sort: 'relevancerank', shouldBracket: false},
  ArtsAndCrafts: {sort: 'relevancerank', shouldBracket: true},
  Automotive: {sort: 'salesrank', shouldBracket: true},
  Baby: {sort: 'salesrank', shouldBracket: true},
  Beauty: {sort: 'salesrank', shouldBracket: true},
  Books: {sort: 'relevancerank', shouldBracket: true},
  WirelessAccessories: {sort: 'relevancerank', shouldBracket: true},
  Apparel: {sort: 'relevancerank', shouldBracket: true},
  Collectibles: {sort: 'relevancerank', shouldBracket: true},
  PCHardware: {sort: 'salesrank', shouldBracket: true},
  Electronics: {sort: 'salesrank', shouldBracket: true},
  Grocery: {sort: 'salesrank', shouldBracket: true},
  HealthPersonalCare: {sort: 'salesrank', shouldBracket: true},
  HomeGarden: {sort: 'salesrank', shouldBracket: true},
  Industrial: {sort: 'salesrank', shouldBracket: true},
  Jewelry: {sort: 'salesrank', shouldBracket: true},
  KindleStore: {sort: 'relevancerank', shouldBracket: true},
  Kitchen: {sort: 'salesrank', shouldBracket: true},
  Magazines: {sort: 'relevancerank', shouldBracket: true},
  Miscellaneous: {sort: 'salesrank', shouldBracket: true},
  DigitalMusic: {sort: 'songtitlerank', shouldBracket: true},
  Music: {sort: 'relevancerank', shouldBracket: true},
  MusicalInstruments: {sort: 'salesrank', shouldBracket: true},
  OfficeProducts: {sort: 'salesrank', shouldBracket: true},
  OutdoorLiving: {sort: 'salesrank', shouldBracket: true},
  LawnGarden: {sort: 'relevancerank', shouldBracket: true},
  PetSupplies: {sort: 'relevancerank', shouldBracket: true},
  Shoes: {sort: 'relevancerank', shouldBracket: true},
  Software: {sort: 'salesrank', shouldBracket: true},
  SportingGoods: {sort: 'relevancerank', shouldBracket: true},
  Tools: {sort: 'salesrank', shouldBracket: true},
  Toys: {sort: 'salesrank', shouldBracket: true},
  VideoGames: {sort: 'salesrank', shouldBracket: true},
  Watches: {sort: 'relevancerank', shouldBracket: true}
}

// because Amazon's API returns either an object or an array of objects,
// this returns an array of one or more objects
exports.arrayIfNot = function arrayIfNot(obj) {
  if (typeof obj === 'undefined') {
    return []
  }

  if (!(obj instanceof Array)) {
    return [obj]
  }

  return obj
}

exports.bySalesRank = function(a, b) {
  return parseInt(a.SalesRank, 10) - parseInt(b.SalesRank, 10)
}

exports.byMinPrice = function(a, b) {
  return a.minPrice - b.minPrice
}

exports.replacePrice = function replacePrice(item) {
    if (item.ItemAttributes !== undefined && item.ItemAttributes.ListPrice === undefined) {
      item.ItemAttributes.ListPrice = (item.OfferSummary !== undefined) ?
        item.OfferSummary.LowestNewPrice :
        {}
    } else if (item.OfferSummary !== undefined && item.OfferSummary.LowestNewPrice === undefined) {
      item.OfferSummary.LowestNewPrice = item.ItemAttributes.ListPrice
    }

    return item
}

exports.standardizeFeatures = function standardizeFeatures(item) {
  if (!item.ItemAttributes.Features) {
    item.ItemAttributes.Features = _.compact([item.ItemAttributes.Feature])
  } else {
    item.ItemAttributes.Features = arrayIfNot(item.ItemAttributes.Features)
  }

  return item
}

exports.queryToValues = function(req) {
  // default values
  return {
    query: req.query.query || req.body.query || '',
    index: req.query.index || req.body.index || 'All',
    node: req.query.node || req.body.node || undefined,
    brand: req.query.brand || req.body.brand || undefined,
    onlyAmazon: req.query.onlyAmazon === 'true' || req.body.onlyAmazon === 'true' || false,
  }
}

exports.cache = {
  cacheKey: function(values) {
    return (values.query.toLowerCase() + values.onlyAmazon.toString()).replace(/ /g, '')
  },

  isCacheable: function(values) {
    return (typeof values.node === 'undefined') &&
      (typeof values.brand === 'undefined') &&
      (values.index === 'All')
  },

  get: function(values, value) {
    if (this.isCacheable(values)) {
      return cache.get(this.cacheKey(values))
    }

    return null
  },

  set: function(values, value) {
    if (this.isCacheable(values)) {
      cache.put(this.cacheKey(values), value, 1*60*60*1000) // 1 hours
    }

    return value
  }
}

exports.promisify = function(fn, self) {
  return function() {
    var args = Array.prototype.slice.call(arguments)
    return new Promise((resolve, reject) => {
      args.push((err, result) => {
        if (err) { return reject(err) }
        return resolve(result)
      })
      fn.apply(self, args)
    })
  }
}

// -> hashed on minPrice (*100 because that makes cents)
exports.bracketPrices = [
  0,
  500,
  1000,
  1500,
  2000,
  2500,
  3000,
  3500,
  4000,
  5000,
  10000,
  15000,
  20000,
  25000,
  30000,
  35000,
  40000,
  45000,
  50000,
  55000,
  60000,
]

exports.priceForItem = function(item) {
  const { ItemAttributes, OfferSummary } = item
  const { ListPrice } = ItemAttributes
  const { LowestNewPrice } = OfferSummary

  if (ListPrice) {
    return parseInt(ListPrice.Amount, 10)
  }

  if (LowestNewPrice) {
    return parseInt(LowestNewPrice, 10)
  }

  return null
}
