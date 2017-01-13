
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

const MAX_PRODUCTS_PER_BUCKET = 10;

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
  if (r !== null) {
    return res.json(r)
  }

  // I now realize async.map is a good way to do this
  var ajaxCalls = 1,
      ajaxCallsMax = 0,
      sets = [],
      nodes = [],
      items,
      didGetPriceRange = false;
      // origResult;


  function callWithOptions(options) {
      var minPrice = 0
      if (options.MinimumPrice !== undefined) {
          minPrice = parseInt(options.MinimumPrice, 10);
      }
      prodAdv.call("ItemSearch", options, function(err, result) {

          var rItems;
          try {
              rItems = arrayIfNot(result.Items.Item);
              var tempArr = [];
              for (var i = 0; i < rItems.length; i++) {
                  if (rItems[i].ItemAttributes.ListPrice !== undefined) {
                      tempArr.push(rItems[i]);
                  }
              }
              rItems = tempArr;
              rItems = rItems.slice(0, 8);
              rItems = rItems.sort(util.bySalesRank).slice(0, MAX_PRODUCTS_PER_BUCKET);
          } catch (err) {
              rItems = 'SHIT';
          }

          // now add image if it's not there and price if no list price
          for (var j = 0; j < rItems.length; j++) {
              rItems[j] = standardizeFeatures(replacePrice(rItems[j]));
          }

          ajaxCalls += 1;
          // push the result to the list of results to return
          // -> should probably rename `items` array for clarity, but whatever
          items.push({
              minPrice: minPrice,
              items: rItems,
              // raw: result
          });

          // if this was the last ajax call
          if (ajaxCalls >= ajaxCallsMax) {
              var response = {
                  // return results sorted by minPrice (which is always a number)
                  buckets: items.sort(util.byMinPrice),
                  // return the narrowing nodes, making sure to `arrayIfNot` the resulting Bin
                  narrowNodes: nodes.map(function(n) {
                      return {
                          '@': n['@'],
                          Bin: arrayIfNot(n.Bin)
                      };
                  }),
                  // return the originalResult for debugging
                  // original: origResult
              };
              util.cache.set(values, response)
              res.json(response);
          }
      });
  }

  function getResultsForItems(itemIDs, idx) {
    return Promise.resolve()
      .then(() => {
        return lookup('ItemLookup', {
          // ItemId is a comma-delimited list of ASINS
          ItemId: itemIDs.join(','),
          ResponseGroup: 'Reviews,SalesRank,Images,OfferSummary,EditorialReview,ItemAttributes',
        })
      })
      .then(itemResult => {
        if (itemResult.Items === undefined || itemResult.Items.Item === undefined) {
          throw 'No Items Found'
        }

        var items = arrayIfNot(itemResult.Items.Item)

        // we need to split them up based on hardcoded price brackets
        for (var i = 0; i < items.length; i++) {
          items[i] = standardizeFeatures(replacePrice(items[i]))
          // also remove the item if it doesn't have reviews
          if (items[i].CustomerReviews.HasReviews === 'false') {
            items.splice(i, 1)
          }
        }

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

  if (index !== 'All') {
      prodAdv.call('ItemSearch', {
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
          }, function(err, result) {
              // if we didn't get a price searchbin, present the user with the correct results and the option to refine the search

              if (result.Items === undefined || result.Items.Item === undefined) {
                  return res.status(404).send('Not Found')
              }

              if (result.Items.SearchBinSets !== undefined && result.Items.SearchBinSets.SearchBinSet !== undefined) {
                  sets = arrayIfNot(result.Items.SearchBinSets.SearchBinSet);
              }

              for (var i = 0; i < sets.length; i++) {
                  // sort the sets into narrowNodes and the PriceRange
                  if (['Categories', 'BrandName', 'Subject'].indexOf(sets[i]['@'].NarrowBy) !== -1) {
                      // we can narrow it down if they're into that
                      nodes.push(sets[i]);
                  // otherwise, all we care about is price
                  // -> but only if the category demands it
                  } else if ((sets[i]['@'].NarrowBy === 'PriceRange') && validSortCriteria[index].shouldBracket) {
                      didGetPriceRange = true;

                      // create a new search with each price range as parameters
                      items = [];
                      sets[i].Bin = arrayIfNot(sets[i].Bin);

                      // console.log(sets[i].Bin.length);
                      // if (sets[i].Bin.length < 2) {
                      //     // manually pricebracket
                      //     console.log(sets[i].Bin);
                      // }

                      // we need to wait for all of the ajax calls to be met
                      // -> this may be a really shitty solution depending on how express works
                      // -> may cause problems with concurrent connections and shit, but I'm hoping it's in a closure
                      ajaxCallsMax = sets[i].Bin.length;
                      for (var j = 0; j < sets[i].Bin.length; j++) {



                          var p = arrayIfNot(sets[i].Bin[j].BinParameter);
                          var options = {
                              SearchIndex: index,
                              Keywords: query,
                              BrowseNode: node,
                              Brand: brand,
                              Availability: 'Available',
                              // Sort: validSortCriteria[index].sort,
                              // these are the details we care about
                              ResponseGroup: 'Reviews,SalesRank,Images,OfferSummary,EditorialReview,ItemAttributes'
                          };

                          // here, we add the MinimumPrice and MaximumPrice values
                          for (var k = 0; k < p.length; k++) {
                              options[p[k].Name] = p[k].Value;
                          }
                          // call the async operation in a closure
                          callWithOptions(options);
                      }
                  }
              }

              if (!didGetPriceRange || !validSortCriteria[index].shouldBracket) {
                  // this means we didn't get a pricebin for a specific index,
                  // which annoys me greatly
                  // like, wtf Amazon, be consistent.

                  // so we're going to fudge it
                  var itemIDs = result.Items.Item.splice(0, Math.min(10, result.Items.Item));
                  itemIDs = result.Items.Item.map(function(item) {
                      return item.ASIN;
                  });
                  getResultsForItems(itemIDs, index)
                    .then(buckets => ({
                      buckets,
                      narrowNodes: nodes
                    }))
                    .then(result => util.cache.set(values, result))
                    .then(result => res.json(result))
                    .catch(onErr)
              }
          }
      );
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
      .then(result => {
        if (!result || !result.Items) {
          throw 'No Result'
        }

        if (result.Items.SearchBinSet !== undefined &&
          result.Items.SearchBinSets.SearchBinSet) {
            nodes = arrayIfNot(result.Items.SearchBinSets.SearchBinSet);
        } else {
            nodes = [];
        }

        const itemIDs = arrayIfNot(result.Items.Item)
          .slice(0, 10)
          .map(item => item.ASIN)

        return getResultsForItems(itemIDs, index)
          .then(buckets => ({
            buckets,
            narrowNodes: nodes
          }))
      })
      .then(result => util.cache.set(values, result))
      .then(result => res.json(result))
      .catch(onErr)
  }
}
