'use strict';

// because Amazon's API returns either an object or an array of objects (REALLY?)
// -> returns an array of one or more objects
function arrayIfNot(obj) {
    if (typeof obj === 'undefined') {
        return [];
    }

    if (!(obj instanceof Array)) {
        return [obj];
    }
    return obj;
}

// valid sort criteria for each index
// because some are supported/not supported in API
var validSort = {
    All: '',
    Appliances: 'relevancerank',
    MobileApps: 'relevancerank',
    ArtsAndCrafts: 'relevancerank',
    Automotive: 'salesrank',
    Baby: 'salesrank',
    Beauty: 'salesrank',
    Books: 'relevancerank',
    WirelessAccessories: 'relevancerank',
    Apparel: 'relevancerank',
    Collectibles: 'relevancerank',
    PCHardware: 'salesrank',
    Electronics: 'salesrank',
    Grocery: 'salesrank',
    HealthPersonalCare: 'salesrank',
    HomeGarden: 'salesrank',
    Industrial: 'salesrank',
    Jewelry: 'salesrank',
    KindleStore: 'relevancerank',
    Kitchen: 'salesrank',
    Magazines: 'relevancerank',
    Miscellaneous: 'salesrank',
    DigitalMusic: 'songtitlerank',
    Music: 'relevancerank',
    MusicalInstruments: 'salesrank',
    OfficeProducts: 'salesrank',
    OutdoorLiving: 'salesrank',
    LawnGarden: 'relevancerank',
    PetSupplies: 'relevancerank',
    Shoes: 'relevancerank',
    Software: 'salesrank',
    SportingGoods: 'relevancerank',
    Tools: 'salesrank',
    Toys: 'salesrank',
    VideoGames: 'salesrank',
    Watches: 'relevancerank'
};

var aws = require('aws-lib');
var info = require('../config/info');
var prodAdv = aws.createProdAdvClient(info.accessKey, info.secretKey, info.trackingID);

/**
 * Get awesome things
 */
exports.search = function(req, res) {
    // default values
    var query = req.query.query;
    var index = req.query.index;
    var node = req.query.node || undefined;
    var brand = req.query.brand || undefined;


    var ajaxCalls = 1,
        ajaxCallsMax = 0,
        sets = [],
        nodes = [],
        items,
        didGetPriceRange = false,
        origResult;


    function callWithOptions(options) {
        var minPrice = 0,
            maxPrice = 'inf';
        if (options.MinimumPrice !== undefined) {
            minPrice = parseInt(options.MinimumPrice, 10);
        }
        if (options.MaximumPrice !== undefined) {
            maxPrice = parseInt(options.MaximumPrice, 10);
        }
        prodAdv.call("ItemSearch", options, function(err, result) {

            var rItems;
            try {
                rItems = arrayIfNot(result.Items.Item);
                rItems = rItems.splice(0, Math.min(8, rItems.length));
                rItems = rItems.sort(function(a,b){
                    return parseInt(a.SalesRank, 10) - parseInt(b.SalesRank, 10);
                }).splice(0, Math.min(2, rItems.length));
            } catch (err) {
                rItems = 'SHIT';
            }


            ajaxCalls += 1;
            // push the result to the list of results to return
            // -> should probably rename `items` array for clarity, but whatever
            items.push({
                minPrice: minPrice,
                maxPrice: maxPrice,
                items: rItems,
                // raw: result
            });

            // if this was the last ajax call
            if (ajaxCalls >= ajaxCallsMax) {
                res.json({
                    // return results sorted by minPrice (which is always a number)
                    results: items.sort(function(a,b){
                        return a.minPrice - b.minPrice;
                    }),
                    // return the narrowing nodes, making sure to `arrayIfNot` the resulting Bin
                    narrowNodes: nodes.map(function(n) {
                        return {
                            '@': n['@'],
                            Bin: arrayIfNot(n.Bin)
                        };
                    }),
                    // return the originalResult for debugging
                    original: origResult
                });
            }
        });
    }


    if (index !== 'All') {
        prodAdv.call("ItemSearch", {
                SearchIndex: index,
                Keywords: query,
                // we want the PriceRange SearchBin
                ResponseGroup: 'SearchBins',
                BrowseNode: node,
                Brand: brand,
                // we only want Available items
                Availability: 'Available',
                // sort by relevance or sales, not rating yet
                Sort: validSort[index]
            }, function(err, result) {
                // if we didn't get a price searchbin, preset the user with the currect results and the option to refine the search

                // save original Result for debugging
                origResult = result;

                if (result.Items.SearchBinSets !== undefined && result.Items.SearchBinSets.SearchBinSet !== undefined) {
                    sets = arrayIfNot(result.Items.SearchBinSets.SearchBinSet);
                }

                for (var i = 0; i < sets.length; i++) {
                    // sort the sets into narrowNodes and the PriceRange
                    if (['Categories', 'BrandName', 'Subject'].indexOf(sets[i]['@'].NarrowBy) !== -1) {
                        // we can narrow it down if they're into that
                        nodes.push(sets[i]);
                    // otherwise, all we care about is price
                    } else if (sets[i]['@'].NarrowBy === 'PriceRange') {
                        didGetPriceRange = true;
                        // create a new search with each price range as parameters
                        items = [];
                        sets[i].Bin = arrayIfNot(sets[i].Bin);
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
                                Sort: validSort[index],
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

                if (!didGetPriceRange) {
                    console.log('THIS SHOULD NEVER BE CALLED');
                    res.json({
                        results: items,
                        narrowNodes: nodes,
                        raw: result
                    });
                }
            }
        );
    } else {
        // is ALL, therefore, make the call and do a batch ItemLookup on the returned results;
        prodAdv.call("ItemSearch", {
                SearchIndex: index,
                Keywords: query,
                // we want the PriceRange SearchBin
                ResponseGroup: 'SearchBins',
                BrowseNode: node,
                Brand: brand,
                // we only want Available items
                Availability: 'Available',
                // sort by relevance or sales, not rating yet
                Sort: validSort[index]
            }, function(err, result) {
                res.json(result);
            }
        );
    }
};