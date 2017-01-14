
const info = {
  accessKey: process.env.PRODUCT_ADVERTISING_ACCESS_KEY,
  secretKey: process.env.PRODUCT_ADVERTISING_SECRET_KEY,
  trackingID: process.env.PRODUCT_ADVERTISING_TRACKING_ID
}

const _ = require('lodash')
const util = require('../util')
const {
  bracketPrices,
  validSortCriteria,
  arrayIfNot,
  replacePrice,
  standardizeFeatures,
} = util

const aws = require('aws-lib')
const prodAdv = aws.createProdAdvClient(info.accessKey, info.secretKey, info.trackingID)
const lookup = util.promisify(prodAdv.call, prodAdv)

const MAX_ITEMS_PER_SEARCH = 10
const MAX_PRODUCTS_PER_BUCKET = 10
const NARROW_NODE_KEYS = ['Categories', 'BrandName', 'Subject']

/**
 * Given a lookup result, return the items, correctly massaged.
 *
 * @TODO(shrugs) - move this util and fix the `this` reference
 */
function itemsFromResponse(results) {
  if (results.Items === undefined || results.Items.Item === undefined) {
    throw 'No Items Found'
  }

  return _(util.arrayIfNot(results.Items.Item))
    .filter(item => item.CustomerReviews.HasReviews !== 'false')
    .map(item => util.standardizeFeatures(util.replacePrice(item)))
    .value()
}

exports.search = function(req, res) {
  const onErr = err => {
    console.log(err)
    res.status(404).send('Not Found')
  }

  const values = util.queryToValues(req)
  const {
    query,
    index,
    node,
    brand,
    onlyAmazon
  } = values

  var r = util.cache.get(values)
  if (r !== null) { return res.json(r) }

  /**
   * Given query options, returns a correctly formatted bucket.
   *
   * @TODO(shrugs) - move to util as well
   */
  function getBucket(options) {
    return Promise.resolve()
      .then(() => {
        return lookup('ItemSearch', options)
      })
      .then(itemsFromResponse)
      .then(items => {
        return {
          minPrice: parseInt(options.MinimumPrice || 0, 10),
          items: items.sort(util.bySalesRank).slice(0, MAX_PRODUCTS_PER_BUCKET)
        }
      })
  }

  /**
   * Give a set of itemIDs, return a set of buckets bucketing those items.
   */
  function getResultsForItems(itemIDs, idx) {
    return Promise.resolve()
      .then(() => {
        return lookup('ItemLookup', {
          // ItemId is a comma-delimited list of ASINS
          ItemId: itemIDs.join(','),
          ResponseGroup: 'Reviews,SalesRank,Images,OfferSummary,EditorialReview,ItemAttributes',
        })
      })
      .then(itemsFromResponse)
      .then(items => {
        // we need to split them up based on hardcoded price brackets
        // because no brackets are provided by the api
        var brackets = {}

        if (validSortCriteria[idx].shouldBracket) {
          for (var n = 0; n < items.length; n++) {
            const item = items[n]
            const itemPrice = util.priceForItem(item)

            // skip this item if it doesn't have a price (???)
            if (itemPrice === null) { continue }

            // then put it in the correct bracket
            //   by iterating from the bottom and stopping when the price is more
            //   than the current bracket
            for (var b = bracketPrices.length; b >= 0; b--) {
              var bracketPrice = parseInt(bracketPrices[b], 10)

              if (itemPrice > bracketPrice) {
                if (!brackets[bracketPrice]) {
                  brackets[bracketPrice] = [item]
                } else {
                  brackets[bracketPrice].push(item)
                }

                break
              }
            }
          }
        } else {
          // this branch is executed for things like apps where the price backets
          // don't really add anything
          brackets['0'] = items;
        }

        // sweet, now order those by SalesRank and only return the first n
        return bracketPrices.map(price => ({
          minPrice: price,
          items: (brackets[price] || []).sort(util.bySalesRank).slice(0, MAX_PRODUCTS_PER_BUCKET)
        }))
      })
  }

  /**
   * Given the result of a lookup request,
   *   responds to the client with the formatted items,
   *   massaged into manual brackets.
   * @TODO(shrugs) - make this not require the `index` semi-global
   */
  function responseForGeneralResult(result) {
    if (!result || !result.Items) {
      throw 'No Result'
    }

    const nodes = result.Items.SearchBinSet && result.Items.SearchBinSets.SearchBinSet ?
      arrayIfNot(result.Items.SearchBinSets.SearchBinSet) :
      []

    const itemIDs = arrayIfNot(result.Items.Item)
      .slice(0, MAX_ITEMS_PER_SEARCH)
      .map(item => item.ASIN)

    return getResultsForItems(itemIDs, index)
      .then(buckets => ({
        buckets,
        narrowNodes: nodes
      }))
  }

  function getResponsePromise() {
    if (index !== 'All') {
      return lookup('ItemSearch', {
        SearchIndex: index,
        Keywords: query,
        // we want the PriceRange SearchBin
        ResponseGroup: 'SearchBins',
        BrowseNode: node,
        Brand: brand,
        // we only want Available items
        Availability: 'Available',
        // sort by relevance or sales, not rating yet
        Sort: validSortCriteria[index].sort,
        MerchantId: onlyAmazon ? 'Amazon' : undefined
      })
      .then(result => {
        if (result.Items === undefined || result.Items.Item === undefined) {
          throw 'No Items Found'
        }

        var sets = []
        if (result.Items.SearchBinSets && result.Items.SearchBinSets.SearchBinSet) {
            sets = arrayIfNot(result.Items.SearchBinSets.SearchBinSet)
        }

        const narrowNodes = _(sets)
          .filter(set => _.includes(NARROW_NODE_KEYS, set['@'].NarrowBy))
          .map(set => {
            set.Bin = arrayIfNot(set.Bin)
            return set
          })
          .value()

        const priceRangeSet = _.find(sets, set => set['@'].NarrowBy === 'PriceRange')
        const shouldBracket = priceRangeSet && validSortCriteria[index].shouldBracket

        if (shouldBracket) {
          const bins = arrayIfNot(priceRangeSet.Bin)
          const opts = _.map(bins, bin => {
            const binParameters = arrayIfNot(bin.BinParameter)
            var options = {
              SearchIndex: index,
              Keywords: query,
              BrowseNode: node,
              Brand: brand,
              Availability: 'Available',
              ResponseGroup: 'Reviews,SalesRank,Images,OfferSummary,EditorialReview,ItemAttributes'
            }

            // here, we add the MinimumPrice and MaximumPrice values
            //   (those are the only name/value pairs in binParameters)
            for (var k = 0; k < binParameters.length; k++) {
                options[binParameters[k].Name] = binParameters[k].Value;
            }

            return options
          })

          return Promise.all(_.map(opts => getBucket(opts)))
            .then(buckets => ({
              buckets: buckets.sort(util.byMinPrice),
              narrowNodes
            }))
        } else {
          // this means we didn't get a pricebin for a specific index,
          // which annoys me greatly
          // like, wtf Amazon, be consistent.
          // so we're going to fudge it like we do with the `All` case
          return responseForGeneralResult(result)
        }

      })
    } else {
      // is ALL, therefore, make the call and do a batch ItemLookup on the returned results;
      return Promise.resolve()
        .then(() => {
          return lookup('ItemSearch', {
            SearchIndex: index,
            Keywords: query,
            // we want the PriceRange SearchBin, which is within SearchBins
            ResponseGroup: 'SearchBins',
            BrowseNode: node,
            Brand: brand,
            // we only want Available items
            Availability: 'Available',
            // sort by relevance or sales, not rating yet
            Sort: validSortCriteria[index].sort,
            MerchantId: onlyAmazon ? 'Amazon' : undefined
          })
        })
        .then(responseForGeneralResult)
    }
  }

  getResponsePromise()
    .then(result => util.cache.set(values, result))
    .then(result => res.json(result))
    .catch(onErr)
}
