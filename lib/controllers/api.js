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
var indexSpecific = {
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
};

var bySalesRank = function(a,b){
    return parseInt(a.SalesRank, 10) - parseInt(b.SalesRank, 10);
};


var aws = require('aws-lib');
var info = {
  accessKey: process.env.PRODUCT_ADVERTISING_ACCESS_KEY,
  secretKey: process.env.PRODUCT_ADVERTISING_SECRET_KEY,
  trackingID: process.env.PRODUCT_ADVERTISING_TRACKING_ID
}
var prodAdv = aws.createProdAdvClient(info.accessKey, info.secretKey, info.trackingID);
var cache = require('memory-cache');
var pgpLib = require('pg-promise');
var pgp = pgpLib();
var cn = {
    host: process.env.RDS_HOSTNAME,
    port: process.env.RDS_PORT,
    database: 'ebdb',
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD
};
var db = pgp(cn);

function dbLog(obj) {
  db.none('INSERT into logs(ts, query, pIndex, node, brand, onlyAmazon, platform) VALUES (${ts}, ${query}, ${pIndex}, ${node}, ${brand}, ${onlyAmazon}, ${platform})', obj);
}

function replacePrice(item) {
    if (item.ItemAttributes !== undefined && item.ItemAttributes.ListPrice === undefined) {
        item.ItemAttributes.ListPrice = (item.OfferSummary !== undefined) ? item.OfferSummary.LowestNewPrice : {};
        // console.log('NEW ListPrice:' + item.ItemAttributes.ListPrice.FormattedPrice);
    } else if (item.OfferSummary !== undefined && item.OfferSummary.LowestNewPrice === undefined) {
        item.OfferSummary.LowestNewPrice = item.ItemAttributes.ListPrice;
    }
    return item;
}



exports.search = function(req, res) {
  res.json({"buckets":[{"items":[],"minPrice":0,"maxPrice":500},{"items":[],"minPrice":500,"maxPrice":1000},{"items":[{"ASIN":"B008YS1ZAO","DetailPageURL":"http://www.amazon.com/BLACK-DECKER-TR1278B-2-Slice-Toaster/dp/B008YS1ZAO%3FSubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D165953%26creativeASIN%3DB008YS1ZAO","ItemLinks":{"ItemLink":[{"Description":"Technical Details","URL":"http://www.amazon.com/BLACK-DECKER-TR1278B-2-Slice-Toaster/dp/tech-data/B008YS1ZAO%3FSubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB008YS1ZAO"},{"Description":"Add To Baby Registry","URL":"http://www.amazon.com/gp/registry/baby/add-item.html%3Fasin.0%3DB008YS1ZAO%26SubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB008YS1ZAO"},{"Description":"Add To Wedding Registry","URL":"http://www.amazon.com/gp/registry/wedding/add-item.html%3Fasin.0%3DB008YS1ZAO%26SubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB008YS1ZAO"},{"Description":"Add To Wishlist","URL":"http://www.amazon.com/gp/registry/wishlist/add-item.html%3Fasin.0%3DB008YS1ZAO%26SubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB008YS1ZAO"},{"Description":"Tell A Friend","URL":"http://www.amazon.com/gp/pdp/taf/B008YS1ZAO%3FSubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB008YS1ZAO"},{"Description":"All Customer Reviews","URL":"http://www.amazon.com/review/product/B008YS1ZAO%3FSubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB008YS1ZAO"},{"Description":"All Offers","URL":"http://www.amazon.com/gp/offer-listing/B008YS1ZAO%3FSubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB008YS1ZAO"}]},"SalesRank":"38","SmallImage":{"URL":"http://ecx.images-amazon.com/images/I/41TeJL3iFpL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"MediumImage":{"URL":"http://ecx.images-amazon.com/images/I/41TeJL3iFpL._SL160_.jpg","Height":{"#":"160","@":{"Units":"pixels"}},"Width":{"#":"160","@":{"Units":"pixels"}}},"LargeImage":{"URL":"http://ecx.images-amazon.com/images/I/41TeJL3iFpL.jpg","Height":{"#":"500","@":{"Units":"pixels"}},"Width":{"#":"500","@":{"Units":"pixels"}}},"ImageSets":{"ImageSet":[{"@":{"Category":"variant"},"SwatchImage":{"URL":"http://ecx.images-amazon.com/images/I/41x-16%2BabXL._SL30_.jpg","Height":{"#":"30","@":{"Units":"pixels"}},"Width":{"#":"30","@":{"Units":"pixels"}}},"SmallImage":{"URL":"http://ecx.images-amazon.com/images/I/41x-16%2BabXL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"ThumbnailImage":{"URL":"http://ecx.images-amazon.com/images/I/41x-16%2BabXL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"TinyImage":{"URL":"http://ecx.images-amazon.com/images/I/41x-16%2BabXL._SL110_.jpg","Height":{"#":"110","@":{"Units":"pixels"}},"Width":{"#":"110","@":{"Units":"pixels"}}},"MediumImage":{"URL":"http://ecx.images-amazon.com/images/I/41x-16%2BabXL._SL160_.jpg","Height":{"#":"160","@":{"Units":"pixels"}},"Width":{"#":"160","@":{"Units":"pixels"}}},"LargeImage":{"URL":"http://ecx.images-amazon.com/images/I/41x-16%2BabXL.jpg","Height":{"#":"500","@":{"Units":"pixels"}},"Width":{"#":"500","@":{"Units":"pixels"}}}},{"@":{"Category":"variant"},"SwatchImage":{"URL":"http://ecx.images-amazon.com/images/I/51I5k5QVt0L._SL30_.jpg","Height":{"#":"30","@":{"Units":"pixels"}},"Width":{"#":"30","@":{"Units":"pixels"}}},"SmallImage":{"URL":"http://ecx.images-amazon.com/images/I/51I5k5QVt0L._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"ThumbnailImage":{"URL":"http://ecx.images-amazon.com/images/I/51I5k5QVt0L._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"TinyImage":{"URL":"http://ecx.images-amazon.com/images/I/51I5k5QVt0L._SL110_.jpg","Height":{"#":"110","@":{"Units":"pixels"}},"Width":{"#":"110","@":{"Units":"pixels"}}},"MediumImage":{"URL":"http://ecx.images-amazon.com/images/I/51I5k5QVt0L._SL160_.jpg","Height":{"#":"160","@":{"Units":"pixels"}},"Width":{"#":"160","@":{"Units":"pixels"}}},"LargeImage":{"URL":"http://ecx.images-amazon.com/images/I/51I5k5QVt0L.jpg","Height":{"#":"500","@":{"Units":"pixels"}},"Width":{"#":"500","@":{"Units":"pixels"}}}},{"@":{"Category":"variant"},"SwatchImage":{"URL":"http://ecx.images-amazon.com/images/I/41Tcv75QzmL._SL30_.jpg","Height":{"#":"30","@":{"Units":"pixels"}},"Width":{"#":"30","@":{"Units":"pixels"}}},"SmallImage":{"URL":"http://ecx.images-amazon.com/images/I/41Tcv75QzmL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"ThumbnailImage":{"URL":"http://ecx.images-amazon.com/images/I/41Tcv75QzmL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"TinyImage":{"URL":"http://ecx.images-amazon.com/images/I/41Tcv75QzmL._SL110_.jpg","Height":{"#":"110","@":{"Units":"pixels"}},"Width":{"#":"110","@":{"Units":"pixels"}}},"MediumImage":{"URL":"http://ecx.images-amazon.com/images/I/41Tcv75QzmL._SL160_.jpg","Height":{"#":"160","@":{"Units":"pixels"}},"Width":{"#":"160","@":{"Units":"pixels"}}},"LargeImage":{"URL":"http://ecx.images-amazon.com/images/I/41Tcv75QzmL.jpg","Height":{"#":"500","@":{"Units":"pixels"}},"Width":{"#":"500","@":{"Units":"pixels"}}}},{"@":{"Category":"variant"},"SwatchImage":{"URL":"http://ecx.images-amazon.com/images/I/41DUf7cRqaL._SL30_.jpg","Height":{"#":"30","@":{"Units":"pixels"}},"Width":{"#":"30","@":{"Units":"pixels"}}},"SmallImage":{"URL":"http://ecx.images-amazon.com/images/I/41DUf7cRqaL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"ThumbnailImage":{"URL":"http://ecx.images-amazon.com/images/I/41DUf7cRqaL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"TinyImage":{"URL":"http://ecx.images-amazon.com/images/I/41DUf7cRqaL._SL110_.jpg","Height":{"#":"110","@":{"Units":"pixels"}},"Width":{"#":"110","@":{"Units":"pixels"}}},"MediumImage":{"URL":"http://ecx.images-amazon.com/images/I/41DUf7cRqaL._SL160_.jpg","Height":{"#":"160","@":{"Units":"pixels"}},"Width":{"#":"160","@":{"Units":"pixels"}}},"LargeImage":{"URL":"http://ecx.images-amazon.com/images/I/41DUf7cRqaL.jpg","Height":{"#":"500","@":{"Units":"pixels"}},"Width":{"#":"500","@":{"Units":"pixels"}}}},{"@":{"Category":"primary"},"SwatchImage":{"URL":"http://ecx.images-amazon.com/images/I/41TeJL3iFpL._SL30_.jpg","Height":{"#":"30","@":{"Units":"pixels"}},"Width":{"#":"30","@":{"Units":"pixels"}}},"SmallImage":{"URL":"http://ecx.images-amazon.com/images/I/41TeJL3iFpL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"ThumbnailImage":{"URL":"http://ecx.images-amazon.com/images/I/41TeJL3iFpL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"TinyImage":{"URL":"http://ecx.images-amazon.com/images/I/41TeJL3iFpL._SL110_.jpg","Height":{"#":"110","@":{"Units":"pixels"}},"Width":{"#":"110","@":{"Units":"pixels"}}},"MediumImage":{"URL":"http://ecx.images-amazon.com/images/I/41TeJL3iFpL._SL160_.jpg","Height":{"#":"160","@":{"Units":"pixels"}},"Width":{"#":"160","@":{"Units":"pixels"}}},"LargeImage":{"URL":"http://ecx.images-amazon.com/images/I/41TeJL3iFpL.jpg","Height":{"#":"500","@":{"Units":"pixels"}},"Width":{"#":"500","@":{"Units":"pixels"}}}}]},"ItemAttributes":{"Binding":"Kitchen","Brand":"BLACK+DECKER","CatalogNumberList":{"CatalogNumberListElement":"WCR-062"},"Color":"Black","EAN":"0885219522280","EANList":{"EANListElement":["0885219522280","0798527418582","7608537611510","0885312286584","0050875808461","0885899698619","0885437379185"]},"Feature":["Product note: the logo design of this item may vary depending on when the product was manufactured","7 toast shades selector, Self-adjusting guides","Bagel, frozen and cancel controls","Extra-wide slots","Extra lift for easy removal"],"ItemDimensions":{"Height":{"#":"1232","@":{"Units":"hundredths-inches"}},"Length":{"#":"858","@":{"Units":"hundredths-inches"}},"Weight":{"#":"2.85","@":{"Units":"pounds"}},"Width":{"#":"909","@":{"Units":"hundredths-inches"}}},"Label":"Applica Incorporated/DBA Black and Decker","Languages":{"Language":{"Name":"English","Type":"Unknown"}},"Manufacturer":"Applica Incorporated/DBA Black and Decker","Model":"TR1278B","MPN":"WCR-062","NumberOfItems":"1","PackageDimensions":{"Height":{"#":"720","@":{"Units":"hundredths-inches"}},"Length":{"#":"1140","@":{"Units":"hundredths-inches"}},"Weight":{"#":"255","@":{"Units":"hundredths-pounds"}},"Width":{"#":"780","@":{"Units":"hundredths-inches"}}},"PackageQuantity":"1","PartNumber":"WCR-062","ProductGroup":"Kitchen","ProductTypeName":"KITCHEN","Publisher":"Applica Incorporated/DBA Black and Decker","Studio":"Applica Incorporated/DBA Black and Decker","Title":"BLACK+DECKER TR1278B 2-Slice Toaster, Black","UPC":"885312286584","UPCList":{"UPCListElement":["885312286584","885437379185","885219522280","050875808461","885899698619","798527418582"]},"Warranty":"2 year limited","ListPrice":{"Amount":"1314","CurrencyCode":"USD","FormattedPrice":"$13.14"}},"OfferSummary":{"LowestNewPrice":{"Amount":"1314","CurrencyCode":"USD","FormattedPrice":"$13.14"},"TotalNew":"31","TotalUsed":"0","TotalCollectible":"0","TotalRefurbished":"0"},"CustomerReviews":{"IFrameURL":"http://www.amazon.com/reviews/iframe?akid=AKIAILTVDPVJHFO5NCWA&alinkCode=xm2&asin=B008YS1ZAO&atag=fivestario-20&exp=2016-05-24T09%3A57%3A11Z&v=2&sig=mHqBf%2FpsyZcNtRpzDJ6ljBcKDXwDRZf5l6ML1EoHwYk%3D","HasReviews":"true"},"EditorialReviews":{"EditorialReview":{"Source":"Product Description","Content":"This black and decker 2 slice toaster allows selection of the perfect toast shade and centers bread for even toasting results. It has easy crumb removal with the drop down crumb tray.","IsLinkSuppressed":"0"}}}],"minPrice":1000,"maxPrice":1500},{"items":[],"minPrice":1500,"maxPrice":2000},{"items":[{"ASIN":"B00CXMO02W","ParentASIN":"B014IU5FJI","DetailPageURL":"http://www.amazon.com/Hamilton-Beach-22811-2-Slice-Toaster/dp/B00CXMO02W%3Fpsc%3D1%26SubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D165953%26creativeASIN%3DB00CXMO02W","ItemLinks":{"ItemLink":[{"Description":"Technical Details","URL":"http://www.amazon.com/Hamilton-Beach-22811-2-Slice-Toaster/dp/tech-data/B00CXMO02W%3FSubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB00CXMO02W"},{"Description":"Add To Baby Registry","URL":"http://www.amazon.com/gp/registry/baby/add-item.html%3Fasin.0%3DB00CXMO02W%26SubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB00CXMO02W"},{"Description":"Add To Wedding Registry","URL":"http://www.amazon.com/gp/registry/wedding/add-item.html%3Fasin.0%3DB00CXMO02W%26SubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB00CXMO02W"},{"Description":"Add To Wishlist","URL":"http://www.amazon.com/gp/registry/wishlist/add-item.html%3Fasin.0%3DB00CXMO02W%26SubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB00CXMO02W"},{"Description":"Tell A Friend","URL":"http://www.amazon.com/gp/pdp/taf/B00CXMO02W%3FSubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB00CXMO02W"},{"Description":"All Customer Reviews","URL":"http://www.amazon.com/review/product/B00CXMO02W%3FSubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB00CXMO02W"},{"Description":"All Offers","URL":"http://www.amazon.com/gp/offer-listing/B00CXMO02W%3FSubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB00CXMO02W"}]},"SalesRank":"381","SmallImage":{"URL":"http://ecx.images-amazon.com/images/I/51pBIYRA9rL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"68","@":{"Units":"pixels"}}},"MediumImage":{"URL":"http://ecx.images-amazon.com/images/I/51pBIYRA9rL._SL160_.jpg","Height":{"#":"160","@":{"Units":"pixels"}},"Width":{"#":"145","@":{"Units":"pixels"}}},"LargeImage":{"URL":"http://ecx.images-amazon.com/images/I/51pBIYRA9rL.jpg","Height":{"#":"500","@":{"Units":"pixels"}},"Width":{"#":"453","@":{"Units":"pixels"}}},"ImageSets":{"ImageSet":[{"@":{"Category":"variant"},"SwatchImage":{"URL":"http://ecx.images-amazon.com/images/I/41IjXHqYTYL._SL30_.jpg","Height":{"#":"30","@":{"Units":"pixels"}},"Width":{"#":"24","@":{"Units":"pixels"}}},"SmallImage":{"URL":"http://ecx.images-amazon.com/images/I/41IjXHqYTYL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"60","@":{"Units":"pixels"}}},"ThumbnailImage":{"URL":"http://ecx.images-amazon.com/images/I/41IjXHqYTYL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"60","@":{"Units":"pixels"}}},"TinyImage":{"URL":"http://ecx.images-amazon.com/images/I/41IjXHqYTYL._SL110_.jpg","Height":{"#":"110","@":{"Units":"pixels"}},"Width":{"#":"88","@":{"Units":"pixels"}}},"MediumImage":{"URL":"http://ecx.images-amazon.com/images/I/41IjXHqYTYL._SL160_.jpg","Height":{"#":"160","@":{"Units":"pixels"}},"Width":{"#":"128","@":{"Units":"pixels"}}},"LargeImage":{"URL":"http://ecx.images-amazon.com/images/I/41IjXHqYTYL.jpg","Height":{"#":"500","@":{"Units":"pixels"}},"Width":{"#":"400","@":{"Units":"pixels"}}}},{"@":{"Category":"variant"},"SwatchImage":{"URL":"http://ecx.images-amazon.com/images/I/6107lD%2BL-cL._SL30_.jpg","Height":{"#":"24","@":{"Units":"pixels"}},"Width":{"#":"30","@":{"Units":"pixels"}}},"SmallImage":{"URL":"http://ecx.images-amazon.com/images/I/6107lD%2BL-cL._SL75_.jpg","Height":{"#":"60","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"ThumbnailImage":{"URL":"http://ecx.images-amazon.com/images/I/6107lD%2BL-cL._SL75_.jpg","Height":{"#":"60","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"TinyImage":{"URL":"http://ecx.images-amazon.com/images/I/6107lD%2BL-cL._SL110_.jpg","Height":{"#":"88","@":{"Units":"pixels"}},"Width":{"#":"110","@":{"Units":"pixels"}}},"MediumImage":{"URL":"http://ecx.images-amazon.com/images/I/6107lD%2BL-cL._SL160_.jpg","Height":{"#":"128","@":{"Units":"pixels"}},"Width":{"#":"160","@":{"Units":"pixels"}}},"LargeImage":{"URL":"http://ecx.images-amazon.com/images/I/6107lD%2BL-cL.jpg","Height":{"#":"400","@":{"Units":"pixels"}},"Width":{"#":"500","@":{"Units":"pixels"}}}},{"@":{"Category":"variant"},"SwatchImage":{"URL":"http://ecx.images-amazon.com/images/I/419tkXl5sQL._SL30_.jpg","Height":{"#":"30","@":{"Units":"pixels"}},"Width":{"#":"24","@":{"Units":"pixels"}}},"SmallImage":{"URL":"http://ecx.images-amazon.com/images/I/419tkXl5sQL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"60","@":{"Units":"pixels"}}},"ThumbnailImage":{"URL":"http://ecx.images-amazon.com/images/I/419tkXl5sQL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"60","@":{"Units":"pixels"}}},"TinyImage":{"URL":"http://ecx.images-amazon.com/images/I/419tkXl5sQL._SL110_.jpg","Height":{"#":"110","@":{"Units":"pixels"}},"Width":{"#":"88","@":{"Units":"pixels"}}},"MediumImage":{"URL":"http://ecx.images-amazon.com/images/I/419tkXl5sQL._SL160_.jpg","Height":{"#":"160","@":{"Units":"pixels"}},"Width":{"#":"128","@":{"Units":"pixels"}}},"LargeImage":{"URL":"http://ecx.images-amazon.com/images/I/419tkXl5sQL.jpg","Height":{"#":"500","@":{"Units":"pixels"}},"Width":{"#":"400","@":{"Units":"pixels"}}}},{"@":{"Category":"variant"},"SwatchImage":{"URL":"http://ecx.images-amazon.com/images/I/41Eur3LB4XL._SL30_.jpg","Height":{"#":"20","@":{"Units":"pixels"}},"Width":{"#":"30","@":{"Units":"pixels"}}},"SmallImage":{"URL":"http://ecx.images-amazon.com/images/I/41Eur3LB4XL._SL75_.jpg","Height":{"#":"50","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"ThumbnailImage":{"URL":"http://ecx.images-amazon.com/images/I/41Eur3LB4XL._SL75_.jpg","Height":{"#":"50","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"TinyImage":{"URL":"http://ecx.images-amazon.com/images/I/41Eur3LB4XL._SL110_.jpg","Height":{"#":"73","@":{"Units":"pixels"}},"Width":{"#":"110","@":{"Units":"pixels"}}},"MediumImage":{"URL":"http://ecx.images-amazon.com/images/I/41Eur3LB4XL._SL160_.jpg","Height":{"#":"107","@":{"Units":"pixels"}},"Width":{"#":"160","@":{"Units":"pixels"}}},"LargeImage":{"URL":"http://ecx.images-amazon.com/images/I/41Eur3LB4XL.jpg","Height":{"#":"333","@":{"Units":"pixels"}},"Width":{"#":"500","@":{"Units":"pixels"}}}},{"@":{"Category":"variant"},"SwatchImage":{"URL":"http://ecx.images-amazon.com/images/I/41eLOYdfzaL._SL30_.jpg","Height":{"#":"20","@":{"Units":"pixels"}},"Width":{"#":"30","@":{"Units":"pixels"}}},"SmallImage":{"URL":"http://ecx.images-amazon.com/images/I/41eLOYdfzaL._SL75_.jpg","Height":{"#":"50","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"ThumbnailImage":{"URL":"http://ecx.images-amazon.com/images/I/41eLOYdfzaL._SL75_.jpg","Height":{"#":"50","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"TinyImage":{"URL":"http://ecx.images-amazon.com/images/I/41eLOYdfzaL._SL110_.jpg","Height":{"#":"73","@":{"Units":"pixels"}},"Width":{"#":"110","@":{"Units":"pixels"}}},"MediumImage":{"URL":"http://ecx.images-amazon.com/images/I/41eLOYdfzaL._SL160_.jpg","Height":{"#":"107","@":{"Units":"pixels"}},"Width":{"#":"160","@":{"Units":"pixels"}}},"LargeImage":{"URL":"http://ecx.images-amazon.com/images/I/41eLOYdfzaL.jpg","Height":{"#":"333","@":{"Units":"pixels"}},"Width":{"#":"500","@":{"Units":"pixels"}}}},{"@":{"Category":"variant"},"SwatchImage":{"URL":"http://ecx.images-amazon.com/images/I/41Hy-hNVyjL._SL30_.jpg","Height":{"#":"20","@":{"Units":"pixels"}},"Width":{"#":"30","@":{"Units":"pixels"}}},"SmallImage":{"URL":"http://ecx.images-amazon.com/images/I/41Hy-hNVyjL._SL75_.jpg","Height":{"#":"50","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"ThumbnailImage":{"URL":"http://ecx.images-amazon.com/images/I/41Hy-hNVyjL._SL75_.jpg","Height":{"#":"50","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"TinyImage":{"URL":"http://ecx.images-amazon.com/images/I/41Hy-hNVyjL._SL110_.jpg","Height":{"#":"73","@":{"Units":"pixels"}},"Width":{"#":"110","@":{"Units":"pixels"}}},"MediumImage":{"URL":"http://ecx.images-amazon.com/images/I/41Hy-hNVyjL._SL160_.jpg","Height":{"#":"107","@":{"Units":"pixels"}},"Width":{"#":"160","@":{"Units":"pixels"}}},"LargeImage":{"URL":"http://ecx.images-amazon.com/images/I/41Hy-hNVyjL.jpg","Height":{"#":"333","@":{"Units":"pixels"}},"Width":{"#":"500","@":{"Units":"pixels"}}}},{"@":{"Category":"primary"},"SwatchImage":{"URL":"http://ecx.images-amazon.com/images/I/51pBIYRA9rL._SL30_.jpg","Height":{"#":"30","@":{"Units":"pixels"}},"Width":{"#":"27","@":{"Units":"pixels"}}},"SmallImage":{"URL":"http://ecx.images-amazon.com/images/I/51pBIYRA9rL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"68","@":{"Units":"pixels"}}},"ThumbnailImage":{"URL":"http://ecx.images-amazon.com/images/I/51pBIYRA9rL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"68","@":{"Units":"pixels"}}},"TinyImage":{"URL":"http://ecx.images-amazon.com/images/I/51pBIYRA9rL._SL110_.jpg","Height":{"#":"110","@":{"Units":"pixels"}},"Width":{"#":"100","@":{"Units":"pixels"}}},"MediumImage":{"URL":"http://ecx.images-amazon.com/images/I/51pBIYRA9rL._SL160_.jpg","Height":{"#":"160","@":{"Units":"pixels"}},"Width":{"#":"145","@":{"Units":"pixels"}}},"LargeImage":{"URL":"http://ecx.images-amazon.com/images/I/51pBIYRA9rL.jpg","Height":{"#":"500","@":{"Units":"pixels"}},"Width":{"#":"453","@":{"Units":"pixels"}}}}]},"ItemAttributes":{"Binding":"Kitchen","Brand":"Hamilton Beach","CatalogNumberList":{"CatalogNumberListElement":["PS-22811","650190"]},"Color":"Silver","EAN":"0791769508158","EANList":{"EANListElement":["0791769508158","0787543870702","0885216353856","0885575473585","0885833458118","0040094228119","6848429843877","0885164827997","0885159022970","0211131845372"]},"Feature":["Your toast stays warm without over toasting","Keep warm setting with ready tone and 3 minute auto shutoff","Cool-wall, stainless steel sides","Toast Boost lifts food higher for easy removal","Easy-push buttons illuminate for easy view"],"IsAdultProduct":"0","ItemDimensions":{"Height":{"#":"775","@":{"Units":"hundredths-inches"}},"Length":{"#":"1188","@":{"Units":"hundredths-inches"}},"Weight":{"#":"325","@":{"Units":"hundredths-pounds"}},"Width":{"#":"700","@":{"Units":"hundredths-inches"}}},"Label":"Hamilton Beach","Manufacturer":"Hamilton Beach","Model":"22811","MPN":"22811","NumberOfItems":"1","PackageDimensions":{"Height":{"#":"830","@":{"Units":"hundredths-inches"}},"Length":{"#":"1300","@":{"Units":"hundredths-inches"}},"Weight":{"#":"355","@":{"Units":"hundredths-pounds"}},"Width":{"#":"840","@":{"Units":"hundredths-inches"}}},"PackageQuantity":"1","PartNumber":"22811","ProductGroup":"Kitchen","ProductTypeName":"KITCHEN","Publisher":"Hamilton Beach","Size":"Extra Wide Slots","Studio":"Hamilton Beach","Title":"Hamilton Beach 22811 Keep Warm 2-Slice Toaster","UPC":"885575473585","UPCList":{"UPCListElement":["885575473585","787543870702","885216353856","040094228119","791769508158","885159022970","885833458118","211131845372","885164827997"]},"ListPrice":{"Amount":"2195","CurrencyCode":"USD","FormattedPrice":"$21.95"}},"OfferSummary":{"LowestNewPrice":{"Amount":"2195","CurrencyCode":"USD","FormattedPrice":"$21.95"},"LowestUsedPrice":{"Amount":"2537","CurrencyCode":"USD","FormattedPrice":"$25.37"},"TotalNew":"41","TotalUsed":"10","TotalCollectible":"0","TotalRefurbished":"0"},"CustomerReviews":{"IFrameURL":"http://www.amazon.com/reviews/iframe?akid=AKIAILTVDPVJHFO5NCWA&alinkCode=xm2&asin=B00CXMO02W&atag=fivestario-20&exp=2016-05-24T09%3A57%3A11Z&v=2&sig=5m62HrMS%2F4xuIHfjYNA5EgxnFjwZyHHIZjamj2gg5yA%3D","HasReviews":"true"},"EditorialReviews":{"EditorialReview":{"Source":"Product Description","Content":"Hamilton Beach 22811 Keep Warm 2-Slice Toaster","IsLinkSuppressed":"0"}}},{"ASIN":"B00CHJDJJQ","DetailPageURL":"http://www.amazon.com/BLACK-DECKER-TR1278RM-2-Slice-Toaster/dp/B00CHJDJJQ%3FSubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D165953%26creativeASIN%3DB00CHJDJJQ","ItemLinks":{"ItemLink":[{"Description":"Technical Details","URL":"http://www.amazon.com/BLACK-DECKER-TR1278RM-2-Slice-Toaster/dp/tech-data/B00CHJDJJQ%3FSubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB00CHJDJJQ"},{"Description":"Add To Baby Registry","URL":"http://www.amazon.com/gp/registry/baby/add-item.html%3Fasin.0%3DB00CHJDJJQ%26SubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB00CHJDJJQ"},{"Description":"Add To Wedding Registry","URL":"http://www.amazon.com/gp/registry/wedding/add-item.html%3Fasin.0%3DB00CHJDJJQ%26SubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB00CHJDJJQ"},{"Description":"Add To Wishlist","URL":"http://www.amazon.com/gp/registry/wishlist/add-item.html%3Fasin.0%3DB00CHJDJJQ%26SubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB00CHJDJJQ"},{"Description":"Tell A Friend","URL":"http://www.amazon.com/gp/pdp/taf/B00CHJDJJQ%3FSubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB00CHJDJJQ"},{"Description":"All Customer Reviews","URL":"http://www.amazon.com/review/product/B00CHJDJJQ%3FSubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB00CHJDJJQ"},{"Description":"All Offers","URL":"http://www.amazon.com/gp/offer-listing/B00CHJDJJQ%3FSubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB00CHJDJJQ"}]},"SalesRank":"1064","SmallImage":{"URL":"http://ecx.images-amazon.com/images/I/41XtaCooOGL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"MediumImage":{"URL":"http://ecx.images-amazon.com/images/I/41XtaCooOGL._SL160_.jpg","Height":{"#":"160","@":{"Units":"pixels"}},"Width":{"#":"160","@":{"Units":"pixels"}}},"LargeImage":{"URL":"http://ecx.images-amazon.com/images/I/41XtaCooOGL.jpg","Height":{"#":"500","@":{"Units":"pixels"}},"Width":{"#":"500","@":{"Units":"pixels"}}},"ImageSets":{"ImageSet":[{"@":{"Category":"variant"},"SwatchImage":{"URL":"http://ecx.images-amazon.com/images/I/41EJNUoppIL._SL30_.jpg","Height":{"#":"30","@":{"Units":"pixels"}},"Width":{"#":"30","@":{"Units":"pixels"}}},"SmallImage":{"URL":"http://ecx.images-amazon.com/images/I/41EJNUoppIL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"ThumbnailImage":{"URL":"http://ecx.images-amazon.com/images/I/41EJNUoppIL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"TinyImage":{"URL":"http://ecx.images-amazon.com/images/I/41EJNUoppIL._SL110_.jpg","Height":{"#":"110","@":{"Units":"pixels"}},"Width":{"#":"110","@":{"Units":"pixels"}}},"MediumImage":{"URL":"http://ecx.images-amazon.com/images/I/41EJNUoppIL._SL160_.jpg","Height":{"#":"160","@":{"Units":"pixels"}},"Width":{"#":"160","@":{"Units":"pixels"}}},"LargeImage":{"URL":"http://ecx.images-amazon.com/images/I/41EJNUoppIL.jpg","Height":{"#":"500","@":{"Units":"pixels"}},"Width":{"#":"500","@":{"Units":"pixels"}}}},{"@":{"Category":"variant"},"SwatchImage":{"URL":"http://ecx.images-amazon.com/images/I/414cLJ6lsoL._SL30_.jpg","Height":{"#":"30","@":{"Units":"pixels"}},"Width":{"#":"30","@":{"Units":"pixels"}}},"SmallImage":{"URL":"http://ecx.images-amazon.com/images/I/414cLJ6lsoL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"ThumbnailImage":{"URL":"http://ecx.images-amazon.com/images/I/414cLJ6lsoL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"TinyImage":{"URL":"http://ecx.images-amazon.com/images/I/414cLJ6lsoL._SL110_.jpg","Height":{"#":"110","@":{"Units":"pixels"}},"Width":{"#":"110","@":{"Units":"pixels"}}},"MediumImage":{"URL":"http://ecx.images-amazon.com/images/I/414cLJ6lsoL._SL160_.jpg","Height":{"#":"160","@":{"Units":"pixels"}},"Width":{"#":"160","@":{"Units":"pixels"}}},"LargeImage":{"URL":"http://ecx.images-amazon.com/images/I/414cLJ6lsoL.jpg","Height":{"#":"500","@":{"Units":"pixels"}},"Width":{"#":"500","@":{"Units":"pixels"}}}},{"@":{"Category":"primary"},"SwatchImage":{"URL":"http://ecx.images-amazon.com/images/I/41XtaCooOGL._SL30_.jpg","Height":{"#":"30","@":{"Units":"pixels"}},"Width":{"#":"30","@":{"Units":"pixels"}}},"SmallImage":{"URL":"http://ecx.images-amazon.com/images/I/41XtaCooOGL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"ThumbnailImage":{"URL":"http://ecx.images-amazon.com/images/I/41XtaCooOGL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"TinyImage":{"URL":"http://ecx.images-amazon.com/images/I/41XtaCooOGL._SL110_.jpg","Height":{"#":"110","@":{"Units":"pixels"}},"Width":{"#":"110","@":{"Units":"pixels"}}},"MediumImage":{"URL":"http://ecx.images-amazon.com/images/I/41XtaCooOGL._SL160_.jpg","Height":{"#":"160","@":{"Units":"pixels"}},"Width":{"#":"160","@":{"Units":"pixels"}}},"LargeImage":{"URL":"http://ecx.images-amazon.com/images/I/41XtaCooOGL.jpg","Height":{"#":"500","@":{"Units":"pixels"}},"Width":{"#":"500","@":{"Units":"pixels"}}}}]},"ItemAttributes":{"Binding":"Kitchen","Brand":"BLACK+DECKER","CatalogNumberList":{"CatalogNumberListElement":["050875808829","50875808829"]},"Color":"Red","EAN":"0798527426563","EANList":{"EANListElement":["0798527426563","5889332945747","0050875808829","0759284101490"]},"Feature":["7 toast shades","Self-adjusting guides centers bread for even toasting results","Extra-wide slots and extra lift enables toasting of bagels and thick breads","Bagel, Frozen and Cancel controls","Drop-down crumb tray"],"ItemDimensions":{"Height":{"#":"950","@":{"Units":"hundredths-inches"}},"Length":{"#":"500","@":{"Units":"hundredths-inches"}},"Weight":{"#":"200","@":{"Units":"hundredths-pounds"}},"Width":{"#":"610","@":{"Units":"hundredths-inches"}}},"Label":"Applica Incorporated/DBA Black and Decker","Languages":{"Language":{"Name":"English","Type":"Unknown"}},"ListPrice":{"Amount":"2499","CurrencyCode":"USD","FormattedPrice":"$24.99"},"Manufacturer":"Applica Incorporated/DBA Black and Decker","Model":"TR1278RM","MPN":"TR1278TRM","PackageDimensions":{"Height":{"#":"800","@":{"Units":"hundredths-inches"}},"Length":{"#":"1230","@":{"Units":"hundredths-inches"}},"Weight":{"#":"255","@":{"Units":"hundredths-pounds"}},"Width":{"#":"800","@":{"Units":"hundredths-inches"}}},"PackageQuantity":"1","PartNumber":"TR1278TRM","ProductGroup":"Kitchen","ProductTypeName":"KITCHEN","Publisher":"Applica Incorporated/DBA Black and Decker","Studio":"Applica Incorporated/DBA Black and Decker","Title":"BLACK+DECKER TR1278RM 2-Slice Toaster, Red","UPC":"050875808829","UPCList":{"UPCListElement":["050875808829","759284101490","798527426563"]}},"OfferSummary":{"LowestNewPrice":{"Amount":"2436","CurrencyCode":"USD","FormattedPrice":"$24.36"},"LowestUsedPrice":{"Amount":"1998","CurrencyCode":"USD","FormattedPrice":"$19.98"},"TotalNew":"10","TotalUsed":"2","TotalCollectible":"0","TotalRefurbished":"0"},"CustomerReviews":{"IFrameURL":"http://www.amazon.com/reviews/iframe?akid=AKIAILTVDPVJHFO5NCWA&alinkCode=xm2&asin=B00CHJDJJQ&atag=fivestario-20&exp=2016-05-24T09%3A57%3A11Z&v=2&sig=zN6t%2BmGbsL7FMb9xi%2F3CfsVmqWd1OqzAhDRutLZSToc%3D","HasReviews":"true"},"EditorialReviews":{"EditorialReview":{"Source":"Product Description","Content":"Toast bread, bagels, waffles and more to your taste, with the Black & Decker 2-Slice Toaster. You can pick your choice of multiple toast shades. It also has a bagel function and frozen function.","IsLinkSuppressed":"0"}}}],"minPrice":2000,"maxPrice":2500},{"items":[{"ASIN":"B00FN3MV88","ParentASIN":"B00MB1ZDKI","DetailPageURL":"http://www.amazon.com/BLACK-DECKER-TO1303SB-4-Slice-Toaster/dp/B00FN3MV88%3Fpsc%3D1%26SubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D165953%26creativeASIN%3DB00FN3MV88","ItemLinks":{"ItemLink":[{"Description":"Technical Details","URL":"http://www.amazon.com/BLACK-DECKER-TO1303SB-4-Slice-Toaster/dp/tech-data/B00FN3MV88%3FSubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB00FN3MV88"},{"Description":"Add To Baby Registry","URL":"http://www.amazon.com/gp/registry/baby/add-item.html%3Fasin.0%3DB00FN3MV88%26SubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB00FN3MV88"},{"Description":"Add To Wedding Registry","URL":"http://www.amazon.com/gp/registry/wedding/add-item.html%3Fasin.0%3DB00FN3MV88%26SubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB00FN3MV88"},{"Description":"Add To Wishlist","URL":"http://www.amazon.com/gp/registry/wishlist/add-item.html%3Fasin.0%3DB00FN3MV88%26SubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB00FN3MV88"},{"Description":"Tell A Friend","URL":"http://www.amazon.com/gp/pdp/taf/B00FN3MV88%3FSubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB00FN3MV88"},{"Description":"All Customer Reviews","URL":"http://www.amazon.com/review/product/B00FN3MV88%3FSubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB00FN3MV88"},{"Description":"All Offers","URL":"http://www.amazon.com/gp/offer-listing/B00FN3MV88%3FSubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB00FN3MV88"}]},"SalesRank":"44","SmallImage":{"URL":"http://ecx.images-amazon.com/images/I/51D06EWU-zL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"MediumImage":{"URL":"http://ecx.images-amazon.com/images/I/51D06EWU-zL._SL160_.jpg","Height":{"#":"160","@":{"Units":"pixels"}},"Width":{"#":"160","@":{"Units":"pixels"}}},"LargeImage":{"URL":"http://ecx.images-amazon.com/images/I/51D06EWU-zL.jpg","Height":{"#":"500","@":{"Units":"pixels"}},"Width":{"#":"500","@":{"Units":"pixels"}}},"ImageSets":{"ImageSet":[{"@":{"Category":"variant"},"SwatchImage":{"URL":"http://ecx.images-amazon.com/images/I/51bV58KecLL._SL30_.jpg","Height":{"#":"30","@":{"Units":"pixels"}},"Width":{"#":"30","@":{"Units":"pixels"}}},"SmallImage":{"URL":"http://ecx.images-amazon.com/images/I/51bV58KecLL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"ThumbnailImage":{"URL":"http://ecx.images-amazon.com/images/I/51bV58KecLL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"TinyImage":{"URL":"http://ecx.images-amazon.com/images/I/51bV58KecLL._SL110_.jpg","Height":{"#":"110","@":{"Units":"pixels"}},"Width":{"#":"110","@":{"Units":"pixels"}}},"MediumImage":{"URL":"http://ecx.images-amazon.com/images/I/51bV58KecLL._SL160_.jpg","Height":{"#":"160","@":{"Units":"pixels"}},"Width":{"#":"160","@":{"Units":"pixels"}}},"LargeImage":{"URL":"http://ecx.images-amazon.com/images/I/51bV58KecLL.jpg","Height":{"#":"500","@":{"Units":"pixels"}},"Width":{"#":"500","@":{"Units":"pixels"}}}},{"@":{"Category":"variant"},"SwatchImage":{"URL":"http://ecx.images-amazon.com/images/I/51mL3dhs4WL._SL30_.jpg","Height":{"#":"30","@":{"Units":"pixels"}},"Width":{"#":"30","@":{"Units":"pixels"}}},"SmallImage":{"URL":"http://ecx.images-amazon.com/images/I/51mL3dhs4WL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"ThumbnailImage":{"URL":"http://ecx.images-amazon.com/images/I/51mL3dhs4WL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"TinyImage":{"URL":"http://ecx.images-amazon.com/images/I/51mL3dhs4WL._SL110_.jpg","Height":{"#":"110","@":{"Units":"pixels"}},"Width":{"#":"110","@":{"Units":"pixels"}}},"MediumImage":{"URL":"http://ecx.images-amazon.com/images/I/51mL3dhs4WL._SL160_.jpg","Height":{"#":"160","@":{"Units":"pixels"}},"Width":{"#":"160","@":{"Units":"pixels"}}},"LargeImage":{"URL":"http://ecx.images-amazon.com/images/I/51mL3dhs4WL.jpg","Height":{"#":"500","@":{"Units":"pixels"}},"Width":{"#":"500","@":{"Units":"pixels"}}}},{"@":{"Category":"variant"},"SwatchImage":{"URL":"http://ecx.images-amazon.com/images/I/511YivOT2XL._SL30_.jpg","Height":{"#":"30","@":{"Units":"pixels"}},"Width":{"#":"30","@":{"Units":"pixels"}}},"SmallImage":{"URL":"http://ecx.images-amazon.com/images/I/511YivOT2XL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"ThumbnailImage":{"URL":"http://ecx.images-amazon.com/images/I/511YivOT2XL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"TinyImage":{"URL":"http://ecx.images-amazon.com/images/I/511YivOT2XL._SL110_.jpg","Height":{"#":"110","@":{"Units":"pixels"}},"Width":{"#":"110","@":{"Units":"pixels"}}},"MediumImage":{"URL":"http://ecx.images-amazon.com/images/I/511YivOT2XL._SL160_.jpg","Height":{"#":"160","@":{"Units":"pixels"}},"Width":{"#":"160","@":{"Units":"pixels"}}},"LargeImage":{"URL":"http://ecx.images-amazon.com/images/I/511YivOT2XL.jpg","Height":{"#":"500","@":{"Units":"pixels"}},"Width":{"#":"500","@":{"Units":"pixels"}}}},{"@":{"Category":"variant"},"SwatchImage":{"URL":"http://ecx.images-amazon.com/images/I/51m4ZTRX%2BpL._SL30_.jpg","Height":{"#":"30","@":{"Units":"pixels"}},"Width":{"#":"30","@":{"Units":"pixels"}}},"SmallImage":{"URL":"http://ecx.images-amazon.com/images/I/51m4ZTRX%2BpL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"ThumbnailImage":{"URL":"http://ecx.images-amazon.com/images/I/51m4ZTRX%2BpL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"TinyImage":{"URL":"http://ecx.images-amazon.com/images/I/51m4ZTRX%2BpL._SL110_.jpg","Height":{"#":"110","@":{"Units":"pixels"}},"Width":{"#":"110","@":{"Units":"pixels"}}},"MediumImage":{"URL":"http://ecx.images-amazon.com/images/I/51m4ZTRX%2BpL._SL160_.jpg","Height":{"#":"160","@":{"Units":"pixels"}},"Width":{"#":"160","@":{"Units":"pixels"}}},"LargeImage":{"URL":"http://ecx.images-amazon.com/images/I/51m4ZTRX%2BpL.jpg","Height":{"#":"500","@":{"Units":"pixels"}},"Width":{"#":"500","@":{"Units":"pixels"}}}},{"@":{"Category":"primary"},"SwatchImage":{"URL":"http://ecx.images-amazon.com/images/I/51D06EWU-zL._SL30_.jpg","Height":{"#":"30","@":{"Units":"pixels"}},"Width":{"#":"30","@":{"Units":"pixels"}}},"SmallImage":{"URL":"http://ecx.images-amazon.com/images/I/51D06EWU-zL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"ThumbnailImage":{"URL":"http://ecx.images-amazon.com/images/I/51D06EWU-zL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"TinyImage":{"URL":"http://ecx.images-amazon.com/images/I/51D06EWU-zL._SL110_.jpg","Height":{"#":"110","@":{"Units":"pixels"}},"Width":{"#":"110","@":{"Units":"pixels"}}},"MediumImage":{"URL":"http://ecx.images-amazon.com/images/I/51D06EWU-zL._SL160_.jpg","Height":{"#":"160","@":{"Units":"pixels"}},"Width":{"#":"160","@":{"Units":"pixels"}}},"LargeImage":{"URL":"http://ecx.images-amazon.com/images/I/51D06EWU-zL.jpg","Height":{"#":"500","@":{"Units":"pixels"}},"Width":{"#":"500","@":{"Units":"pixels"}}}}]},"ItemAttributes":{"Binding":"Kitchen","Brand":"BLACK+DECKER","CatalogNumberList":{"CatalogNumberListElement":["TO1303SB","5087580988"]},"Color":"Silver","EAN":"0744828467514","EANList":{"EANListElement":["0744828467514","0885568368232","0885459742707","0885675798700","5062931290702","0885233606720","0785983739368","8111164451903","0885165437683","0885689195915","0050875809888","0798527477282","0801947299904","0885448380590","0808113002276","0697046428822","9147113137856","0885886105670","0508758098886","0885168233404","0885254559210","0885793356875","5062931288686"]},"Feature":["Product note: the logo design of this item may vary depending on when the product was manufactured","Exclusive Even Toast Technology, Bake pan and broil rack included","Fits a 9\" pizza","30 Minute timer with stay-on function; Removable crumb tray","Product internal dimensions: 10.75\"x9\"x7\" approx.","Dimensions : Width: 15.5 inches, Length: 9.8 inches, Height: 8.8 inches"],"IsAutographed":"0","ItemDimensions":{"Height":{"#":"840","@":{"Units":"hundredths-inches"}},"Length":{"#":"1000","@":{"Units":"hundredths-inches"}},"Weight":{"#":"750","@":{"Units":"hundredths-pounds"}},"Width":{"#":"1550","@":{"Units":"hundredths-inches"}}},"Label":"BLACK+DECKER","Languages":{"Language":{"Name":"English","Type":"Unknown"}},"ListPrice":{"Amount":"3999","CurrencyCode":"USD","FormattedPrice":"$39.99"},"Manufacturer":"BLACK+DECKER","Model":"TO1303SB","MPN":"TO1303SB","NumberOfItems":"1","PackageDimensions":{"Height":{"#":"920","@":{"Units":"hundredths-inches"}},"Length":{"#":"1750","@":{"Units":"hundredths-inches"}},"Weight":{"#":"805","@":{"Units":"hundredths-pounds"}},"Width":{"#":"1210","@":{"Units":"hundredths-inches"}}},"PackageQuantity":"1","PartNumber":"TO1303SB","ProductGroup":"Kitchen","ProductTypeName":"KITCHEN","Publisher":"BLACK+DECKER","Size":"4-Slice","Studio":"BLACK+DECKER","Title":"BLACK+DECKER TO1303SB 4-Slice Toaster Oven, Silver","UPC":"885168233404","UPCList":{"UPCListElement":["885168233404","801947299904","885254559210","798527477282","885459742707","885448380590","885675798700","885568368232","885165437683","885793356875","885886105670","785983739368","808113002276","050875809888","744828467514","885689195915","885233606720","697046428822","508758098886"]},"Warranty":"2 Year Limited Manufacturer Warranty"},"OfferSummary":{"LowestNewPrice":{"Amount":"2788","CurrencyCode":"USD","FormattedPrice":"$27.88"},"LowestUsedPrice":{"Amount":"2543","CurrencyCode":"USD","FormattedPrice":"$25.43"},"TotalNew":"82","TotalUsed":"3","TotalCollectible":"0","TotalRefurbished":"0"},"CustomerReviews":{"IFrameURL":"http://www.amazon.com/reviews/iframe?akid=AKIAILTVDPVJHFO5NCWA&alinkCode=xm2&asin=B00FN3MV88&atag=fivestario-20&exp=2016-05-24T09%3A57%3A11Z&v=2&sig=lWIxHl1aUNqT3IJL%2FH%2BSQbvB7cBv4mteMxL%2BYGf2iJ4%3D","HasReviews":"true"},"EditorialReviews":{"EditorialReview":{"Source":"Product Description","Content":"The Black & Decker four-slice toaster oven is a kitchen counter classic. No need to heat up the conventional oven, this model (model TO1303SB) allows you to get cooking in a hurry. The large window and cooking timer, with stay-on function, allow you to cook exactly to your specifications. And, the efficient size still allows for up to four slices of bread or a 9\" pizza.","IsLinkSuppressed":"0"}}},{"ASIN":"B00SMS3KZO","DetailPageURL":"http://www.amazon.com/BLACK-DECKER-TR1478BD-4-Slice-Toaster/dp/B00SMS3KZO%3FSubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D165953%26creativeASIN%3DB00SMS3KZO","ItemLinks":{"ItemLink":[{"Description":"Technical Details","URL":"http://www.amazon.com/BLACK-DECKER-TR1478BD-4-Slice-Toaster/dp/tech-data/B00SMS3KZO%3FSubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB00SMS3KZO"},{"Description":"Add To Baby Registry","URL":"http://www.amazon.com/gp/registry/baby/add-item.html%3Fasin.0%3DB00SMS3KZO%26SubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB00SMS3KZO"},{"Description":"Add To Wedding Registry","URL":"http://www.amazon.com/gp/registry/wedding/add-item.html%3Fasin.0%3DB00SMS3KZO%26SubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB00SMS3KZO"},{"Description":"Add To Wishlist","URL":"http://www.amazon.com/gp/registry/wishlist/add-item.html%3Fasin.0%3DB00SMS3KZO%26SubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB00SMS3KZO"},{"Description":"Tell A Friend","URL":"http://www.amazon.com/gp/pdp/taf/B00SMS3KZO%3FSubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB00SMS3KZO"},{"Description":"All Customer Reviews","URL":"http://www.amazon.com/review/product/B00SMS3KZO%3FSubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB00SMS3KZO"},{"Description":"All Offers","URL":"http://www.amazon.com/gp/offer-listing/B00SMS3KZO%3FSubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB00SMS3KZO"}]},"SalesRank":"307","SmallImage":{"URL":"http://ecx.images-amazon.com/images/I/51-N7NjN7zL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"MediumImage":{"URL":"http://ecx.images-amazon.com/images/I/51-N7NjN7zL._SL160_.jpg","Height":{"#":"160","@":{"Units":"pixels"}},"Width":{"#":"160","@":{"Units":"pixels"}}},"LargeImage":{"URL":"http://ecx.images-amazon.com/images/I/51-N7NjN7zL.jpg","Height":{"#":"500","@":{"Units":"pixels"}},"Width":{"#":"500","@":{"Units":"pixels"}}},"ImageSets":{"ImageSet":[{"@":{"Category":"variant"},"SwatchImage":{"URL":"http://ecx.images-amazon.com/images/I/51nCVDcMXsL._SL30_.jpg","Height":{"#":"30","@":{"Units":"pixels"}},"Width":{"#":"30","@":{"Units":"pixels"}}},"SmallImage":{"URL":"http://ecx.images-amazon.com/images/I/51nCVDcMXsL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"ThumbnailImage":{"URL":"http://ecx.images-amazon.com/images/I/51nCVDcMXsL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"TinyImage":{"URL":"http://ecx.images-amazon.com/images/I/51nCVDcMXsL._SL110_.jpg","Height":{"#":"110","@":{"Units":"pixels"}},"Width":{"#":"110","@":{"Units":"pixels"}}},"MediumImage":{"URL":"http://ecx.images-amazon.com/images/I/51nCVDcMXsL._SL160_.jpg","Height":{"#":"160","@":{"Units":"pixels"}},"Width":{"#":"160","@":{"Units":"pixels"}}},"LargeImage":{"URL":"http://ecx.images-amazon.com/images/I/51nCVDcMXsL.jpg","Height":{"#":"500","@":{"Units":"pixels"}},"Width":{"#":"500","@":{"Units":"pixels"}}}},{"@":{"Category":"variant"},"SwatchImage":{"URL":"http://ecx.images-amazon.com/images/I/41PQFAw26FL._SL30_.jpg","Height":{"#":"30","@":{"Units":"pixels"}},"Width":{"#":"30","@":{"Units":"pixels"}}},"SmallImage":{"URL":"http://ecx.images-amazon.com/images/I/41PQFAw26FL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"ThumbnailImage":{"URL":"http://ecx.images-amazon.com/images/I/41PQFAw26FL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"TinyImage":{"URL":"http://ecx.images-amazon.com/images/I/41PQFAw26FL._SL110_.jpg","Height":{"#":"110","@":{"Units":"pixels"}},"Width":{"#":"110","@":{"Units":"pixels"}}},"MediumImage":{"URL":"http://ecx.images-amazon.com/images/I/41PQFAw26FL._SL160_.jpg","Height":{"#":"160","@":{"Units":"pixels"}},"Width":{"#":"160","@":{"Units":"pixels"}}},"LargeImage":{"URL":"http://ecx.images-amazon.com/images/I/41PQFAw26FL.jpg","Height":{"#":"500","@":{"Units":"pixels"}},"Width":{"#":"500","@":{"Units":"pixels"}}}},{"@":{"Category":"variant"},"SwatchImage":{"URL":"http://ecx.images-amazon.com/images/I/51v7cg46QtL._SL30_.jpg","Height":{"#":"30","@":{"Units":"pixels"}},"Width":{"#":"30","@":{"Units":"pixels"}}},"SmallImage":{"URL":"http://ecx.images-amazon.com/images/I/51v7cg46QtL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"ThumbnailImage":{"URL":"http://ecx.images-amazon.com/images/I/51v7cg46QtL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"TinyImage":{"URL":"http://ecx.images-amazon.com/images/I/51v7cg46QtL._SL110_.jpg","Height":{"#":"110","@":{"Units":"pixels"}},"Width":{"#":"110","@":{"Units":"pixels"}}},"MediumImage":{"URL":"http://ecx.images-amazon.com/images/I/51v7cg46QtL._SL160_.jpg","Height":{"#":"160","@":{"Units":"pixels"}},"Width":{"#":"160","@":{"Units":"pixels"}}},"LargeImage":{"URL":"http://ecx.images-amazon.com/images/I/51v7cg46QtL.jpg","Height":{"#":"500","@":{"Units":"pixels"}},"Width":{"#":"500","@":{"Units":"pixels"}}}},{"@":{"Category":"primary"},"SwatchImage":{"URL":"http://ecx.images-amazon.com/images/I/51-N7NjN7zL._SL30_.jpg","Height":{"#":"30","@":{"Units":"pixels"}},"Width":{"#":"30","@":{"Units":"pixels"}}},"SmallImage":{"URL":"http://ecx.images-amazon.com/images/I/51-N7NjN7zL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"ThumbnailImage":{"URL":"http://ecx.images-amazon.com/images/I/51-N7NjN7zL._SL75_.jpg","Height":{"#":"75","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"TinyImage":{"URL":"http://ecx.images-amazon.com/images/I/51-N7NjN7zL._SL110_.jpg","Height":{"#":"110","@":{"Units":"pixels"}},"Width":{"#":"110","@":{"Units":"pixels"}}},"MediumImage":{"URL":"http://ecx.images-amazon.com/images/I/51-N7NjN7zL._SL160_.jpg","Height":{"#":"160","@":{"Units":"pixels"}},"Width":{"#":"160","@":{"Units":"pixels"}}},"LargeImage":{"URL":"http://ecx.images-amazon.com/images/I/51-N7NjN7zL.jpg","Height":{"#":"500","@":{"Units":"pixels"}},"Width":{"#":"500","@":{"Units":"pixels"}}}}]},"ItemAttributes":{"Binding":"Kitchen","Brand":"BLACK+DECKER","Color":"Black","EAN":"0787461596357","EANList":{"EANListElement":["0787461596357","0798527480619","0050875810341","0759284234815","0885568344984"]},"Feature":["Toast Shade Selector","Extra-Wide Slots","Extended Lift","Functions, cleanup a breeze and the integrated cord wrap simplifies storage","Crumb Tray, breeze and the integrated cord wrap simplifies storage"],"ItemDimensions":{"Height":{"#":"800","@":{"Units":"hundredths-inches"}},"Length":{"#":"1230","@":{"Units":"hundredths-inches"}},"Weight":{"#":"4.1","@":{"Units":"pounds"}},"Width":{"#":"1200","@":{"Units":"hundredths-inches"}}},"Label":"Black & Decker","Languages":{"Language":{"Name":"English","Type":"Unknown"}},"ListPrice":{"Amount":"3999","CurrencyCode":"USD","FormattedPrice":"$39.99"},"Manufacturer":"Black & Decker","Model":"TR1478BD","MPN":"TR1478BD","PackageDimensions":{"Height":{"#":"760","@":{"Units":"hundredths-inches"}},"Length":{"#":"1150","@":{"Units":"hundredths-inches"}},"Weight":{"#":"410","@":{"Units":"hundredths-pounds"}},"Width":{"#":"1150","@":{"Units":"hundredths-inches"}}},"PackageQuantity":"1","PartNumber":"TR1478BD","ProductGroup":"Kitchen","ProductTypeName":"KITCHEN","Publisher":"Black & Decker","Studio":"Black & Decker","Title":"BLACK+DECKER TR1478BD 4-Slice Toaster, Black","UPC":"885568344984","UPCList":{"UPCListElement":["885568344984","050875810341","759284234815","787461596357","798527480619"]}},"OfferSummary":{"LowestNewPrice":{"Amount":"2992","CurrencyCode":"USD","FormattedPrice":"$29.92"},"LowestUsedPrice":{"Amount":"2543","CurrencyCode":"USD","FormattedPrice":"$25.43"},"LowestRefurbishedPrice":{"Amount":"2600","CurrencyCode":"USD","FormattedPrice":"$26.00"},"TotalNew":"22","TotalUsed":"3","TotalCollectible":"0","TotalRefurbished":"1"},"CustomerReviews":{"IFrameURL":"http://www.amazon.com/reviews/iframe?akid=AKIAILTVDPVJHFO5NCWA&alinkCode=xm2&asin=B00SMS3KZO&atag=fivestario-20&exp=2016-05-24T09%3A57%3A11Z&v=2&sig=v7AZTKdJ%2FwgCMTlxUnDkaw34iUsR8kl6ekzX4Xd%2Fxc8%3D","HasReviews":"true"},"EditorialReviews":{"EditorialReview":{"Source":"Product Description","Content":"Make breakfast for everyone with Black + Decker's 4-Slice Toaster, TR1478BD. Extra-wide slots with self-adjusting guides toast thick bagels and artisan breads with ease and the high-lift lever leaves your food easily in reach. One-touch bagel and frozen options control the length of toasting for ideal results and a cancel button allows you to cancel toasting at any time. The drop-down crumb tray makes cleanup a breeze and the integrated cord wrap simplifies storage.","IsLinkSuppressed":"0"}}}],"minPrice":2500,"maxPrice":3000},{"items":[],"minPrice":3000,"maxPrice":3500},{"items":[{"ASIN":"B007JRUSE0","ParentASIN":"B01EA3RWYE","DetailPageURL":"http://www.amazon.com/Oster-TSSTTRWF4S-4-Slice-Toaster/dp/B007JRUSE0%3Fpsc%3D1%26SubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D165953%26creativeASIN%3DB007JRUSE0","ItemLinks":{"ItemLink":[{"Description":"Technical Details","URL":"http://www.amazon.com/Oster-TSSTTRWF4S-4-Slice-Toaster/dp/tech-data/B007JRUSE0%3FSubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB007JRUSE0"},{"Description":"Add To Baby Registry","URL":"http://www.amazon.com/gp/registry/baby/add-item.html%3Fasin.0%3DB007JRUSE0%26SubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB007JRUSE0"},{"Description":"Add To Wedding Registry","URL":"http://www.amazon.com/gp/registry/wedding/add-item.html%3Fasin.0%3DB007JRUSE0%26SubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB007JRUSE0"},{"Description":"Add To Wishlist","URL":"http://www.amazon.com/gp/registry/wishlist/add-item.html%3Fasin.0%3DB007JRUSE0%26SubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB007JRUSE0"},{"Description":"Tell A Friend","URL":"http://www.amazon.com/gp/pdp/taf/B007JRUSE0%3FSubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB007JRUSE0"},{"Description":"All Customer Reviews","URL":"http://www.amazon.com/review/product/B007JRUSE0%3FSubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB007JRUSE0"},{"Description":"All Offers","URL":"http://www.amazon.com/gp/offer-listing/B007JRUSE0%3FSubscriptionId%3DAKIAILTVDPVJHFO5NCWA%26tag%3Dfivestario-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB007JRUSE0"}]},"SalesRank":"478","SmallImage":{"URL":"http://ecx.images-amazon.com/images/I/41gwpCLo-EL._SL75_.jpg","Height":{"#":"61","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"MediumImage":{"URL":"http://ecx.images-amazon.com/images/I/41gwpCLo-EL._SL160_.jpg","Height":{"#":"130","@":{"Units":"pixels"}},"Width":{"#":"160","@":{"Units":"pixels"}}},"LargeImage":{"URL":"http://ecx.images-amazon.com/images/I/41gwpCLo-EL.jpg","Height":{"#":"405","@":{"Units":"pixels"}},"Width":{"#":"500","@":{"Units":"pixels"}}},"ImageSets":{"ImageSet":[{"@":{"Category":"variant"},"SwatchImage":{"URL":"http://ecx.images-amazon.com/images/I/41gXXa-U2LL._SL30_.jpg","Height":{"#":"27","@":{"Units":"pixels"}},"Width":{"#":"30","@":{"Units":"pixels"}}},"SmallImage":{"URL":"http://ecx.images-amazon.com/images/I/41gXXa-U2LL._SL75_.jpg","Height":{"#":"68","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"ThumbnailImage":{"URL":"http://ecx.images-amazon.com/images/I/41gXXa-U2LL._SL75_.jpg","Height":{"#":"68","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"TinyImage":{"URL":"http://ecx.images-amazon.com/images/I/41gXXa-U2LL._SL110_.jpg","Height":{"#":"100","@":{"Units":"pixels"}},"Width":{"#":"110","@":{"Units":"pixels"}}},"MediumImage":{"URL":"http://ecx.images-amazon.com/images/I/41gXXa-U2LL._SL160_.jpg","Height":{"#":"145","@":{"Units":"pixels"}},"Width":{"#":"160","@":{"Units":"pixels"}}},"LargeImage":{"URL":"http://ecx.images-amazon.com/images/I/41gXXa-U2LL.jpg","Height":{"#":"453","@":{"Units":"pixels"}},"Width":{"#":"500","@":{"Units":"pixels"}}}},{"@":{"Category":"variant"},"SwatchImage":{"URL":"http://ecx.images-amazon.com/images/I/41B5PoLtF6L._SL30_.jpg","Height":{"#":"24","@":{"Units":"pixels"}},"Width":{"#":"30","@":{"Units":"pixels"}}},"SmallImage":{"URL":"http://ecx.images-amazon.com/images/I/41B5PoLtF6L._SL75_.jpg","Height":{"#":"61","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"ThumbnailImage":{"URL":"http://ecx.images-amazon.com/images/I/41B5PoLtF6L._SL75_.jpg","Height":{"#":"61","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"TinyImage":{"URL":"http://ecx.images-amazon.com/images/I/41B5PoLtF6L._SL110_.jpg","Height":{"#":"90","@":{"Units":"pixels"}},"Width":{"#":"110","@":{"Units":"pixels"}}},"MediumImage":{"URL":"http://ecx.images-amazon.com/images/I/41B5PoLtF6L._SL160_.jpg","Height":{"#":"130","@":{"Units":"pixels"}},"Width":{"#":"160","@":{"Units":"pixels"}}},"LargeImage":{"URL":"http://ecx.images-amazon.com/images/I/41B5PoLtF6L.jpg","Height":{"#":"407","@":{"Units":"pixels"}},"Width":{"#":"500","@":{"Units":"pixels"}}}},{"@":{"Category":"variant"},"SwatchImage":{"URL":"http://ecx.images-amazon.com/images/I/41Hsy1D-ckL._SL30_.jpg","Height":{"#":"22","@":{"Units":"pixels"}},"Width":{"#":"30","@":{"Units":"pixels"}}},"SmallImage":{"URL":"http://ecx.images-amazon.com/images/I/41Hsy1D-ckL._SL75_.jpg","Height":{"#":"55","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"ThumbnailImage":{"URL":"http://ecx.images-amazon.com/images/I/41Hsy1D-ckL._SL75_.jpg","Height":{"#":"55","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"TinyImage":{"URL":"http://ecx.images-amazon.com/images/I/41Hsy1D-ckL._SL110_.jpg","Height":{"#":"81","@":{"Units":"pixels"}},"Width":{"#":"110","@":{"Units":"pixels"}}},"MediumImage":{"URL":"http://ecx.images-amazon.com/images/I/41Hsy1D-ckL._SL160_.jpg","Height":{"#":"117","@":{"Units":"pixels"}},"Width":{"#":"160","@":{"Units":"pixels"}}},"LargeImage":{"URL":"http://ecx.images-amazon.com/images/I/41Hsy1D-ckL.jpg","Height":{"#":"366","@":{"Units":"pixels"}},"Width":{"#":"500","@":{"Units":"pixels"}}}},{"@":{"Category":"primary"},"SwatchImage":{"URL":"http://ecx.images-amazon.com/images/I/41gwpCLo-EL._SL30_.jpg","Height":{"#":"24","@":{"Units":"pixels"}},"Width":{"#":"30","@":{"Units":"pixels"}}},"SmallImage":{"URL":"http://ecx.images-amazon.com/images/I/41gwpCLo-EL._SL75_.jpg","Height":{"#":"61","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"ThumbnailImage":{"URL":"http://ecx.images-amazon.com/images/I/41gwpCLo-EL._SL75_.jpg","Height":{"#":"61","@":{"Units":"pixels"}},"Width":{"#":"75","@":{"Units":"pixels"}}},"TinyImage":{"URL":"http://ecx.images-amazon.com/images/I/41gwpCLo-EL._SL110_.jpg","Height":{"#":"89","@":{"Units":"pixels"}},"Width":{"#":"110","@":{"Units":"pixels"}}},"MediumImage":{"URL":"http://ecx.images-amazon.com/images/I/41gwpCLo-EL._SL160_.jpg","Height":{"#":"130","@":{"Units":"pixels"}},"Width":{"#":"160","@":{"Units":"pixels"}}},"LargeImage":{"URL":"http://ecx.images-amazon.com/images/I/41gwpCLo-EL.jpg","Height":{"#":"405","@":{"Units":"pixels"}},"Width":{"#":"500","@":{"Units":"pixels"}}}}]},"ItemAttributes":{"Binding":"Kitchen","Brand":"Oster","CatalogNumberList":{"CatalogNumberListElement":"TSSTTRWF-4"},"Color":"Stainless Steel","EAN":"5889332945280","EANList":{"EANListElement":["5889332945280","0885147864568","7661459841960","0034264446809","0887657449167"]},"Feature":["Extra wide slots to accommodate a variety of breads","Settings: bagel, frozen, reheat, cancel","Retractable cord for easy storage","Dishwasher safe, removable crumb tray for easy cleaning","7 toast shade settings for light to dark toasting"],"ItemDimensions":{"Height":{"#":"850","@":{"Units":"hundredths-inches"}},"Length":{"#":"1270","@":{"Units":"hundredths-inches"}},"Weight":{"#":"620","@":{"Units":"hundredths-pounds"}},"Width":{"#":"1300","@":{"Units":"hundredths-inches"}}},"Label":"Oster","Languages":{"Language":{"Name":"English","Type":"Unknown"}},"ListPrice":{"Amount":"3999","CurrencyCode":"USD","FormattedPrice":"$39.99"},"Manufacturer":"Oster","Model":"TSSTTRWF4S","MPN":"7H4KU7M61.49-PTR","NumberOfItems":"1","PackageDimensions":{"Height":{"#":"850","@":{"Units":"hundredths-inches"}},"Length":{"#":"1280","@":{"Units":"hundredths-inches"}},"Weight":{"#":"620","@":{"Units":"hundredths-pounds"}},"Width":{"#":"1280","@":{"Units":"hundredths-inches"}}},"PackageQuantity":"1","PartNumber":"7H4KU7M61.49-PTR","ProductGroup":"Kitchen","ProductTypeName":"KITCHEN","Publisher":"Oster","Size":"4 Slice","Studio":"Oster","Title":"Oster TSSTTRWF4S 4-Slice Toaster","UPC":"885147864568","UPCList":{"UPCListElement":["885147864568","887657449167","034264446809"]},"Warranty":"1 year limited warranty"},"OfferSummary":{"LowestNewPrice":{"Amount":"3999","CurrencyCode":"USD","FormattedPrice":"$39.99"},"LowestUsedPrice":{"Amount":"3399","CurrencyCode":"USD","FormattedPrice":"$33.99"},"TotalNew":"22","TotalUsed":"19","TotalCollectible":"0","TotalRefurbished":"0"},"CustomerReviews":{"IFrameURL":"http://www.amazon.com/reviews/iframe?akid=AKIAILTVDPVJHFO5NCWA&alinkCode=xm2&asin=B007JRUSE0&atag=fivestario-20&exp=2016-05-24T09%3A57%3A11Z&v=2&sig=2ZIvJaGypIDSuvw%2BigWIR8bMlDI4gzGyXmilTG3wCAk%3D","HasReviews":"true"},"EditorialReviews":{"EditorialReview":{"Source":"Product Description","Content":"4-SLICE CAPACITYBAGEL FROZEN REHEAT CANCEL SETTINGSEXTRA-WIDE SLOTS TO ACCOMMODATE A VARIETY OF BREADSDUAL AUTO-ADJUSTING BREAD GUIDES ADJUST TO BREAD THICKNESS FOR EVEN TOASTINGANTI-JAM FEATURE AUTOMATICALLY SHUTS TOASTER OFFADVANCED TOASTING TECHNOLOGY FOR CONSISTENT TOASTINGTOAST LIFT ELEVATES BREADS FOR EASY RETRIEVALDISHWASHER SAFE REMOVABLE CRUMB TRAY FOR EASY CLEANING7 TOAST SHADE SETTINGS FOR LIGHT TO DARK TOASTINGUPC : 034264446809Estimated Shipping Weight : 0.0","IsLinkSuppressed":"0"}}}],"minPrice":3500,"maxPrice":4000},{"items":[],"minPrice":4000,"maxPrice":5000},{"items":[],"minPrice":5000,"maxPrice":10000},{"items":[],"minPrice":10000,"maxPrice":15000},{"items":[],"minPrice":15000,"maxPrice":20000},{"items":[],"minPrice":20000,"maxPrice":25000},{"items":[],"minPrice":25000,"maxPrice":30000},{"items":[],"minPrice":30000,"maxPrice":35000},{"items":[],"minPrice":35000,"maxPrice":40000},{"items":[],"minPrice":40000,"maxPrice":45000},{"items":[],"minPrice":45000,"maxPrice":50000},{"items":[],"minPrice":50000,"maxPrice":55000},{"items":[],"minPrice":55000,"maxPrice":60000},{"items":[],"minPrice":60000,"maxPrice":"inf"}],"narrowNodes":[]})
  return
    // default values
    var query = req.query.query || req.body.query || '';
    var index = req.query.index || req.body.index || 'All';
    var node = req.query.node || req.body.node || undefined;
    var brand = req.query.brand || req.body.brand || undefined;
    var onlyAmazon = req.query.onlyAmazon === 'true' || req.body.onlyAmazon === 'true' || false;
    var platform = req.query.platform || req.body.platform || 'web';

    dbLog({
      ts: new Date(),
      query: query,
      pIndex: index,
      node: node,
      brand: brand,
      onlyAmazon: onlyAmazon,
      platform: platform
    });

    var maxProductsPerBucket = platform === 'app' ? 4 : 2;

    var cacheKey = (query.toLowerCase()+onlyAmazon.toString()).replace(/ /g, '');

    if ((typeof node === 'undefined') && (typeof brand === 'undefined') && (index === 'All') && (cache.get(cacheKey) !== null)) {
        console.log('[CACHE]', cacheKey);
        res.json(cache.get(cacheKey));
        return;
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
                var tempArr = [];
                for (var i = 0; i < rItems.length; i++) {
                    if (rItems[i].ItemAttributes.ListPrice !== undefined) {
                        tempArr.push(rItems[i]);
                    }
                }
                rItems = tempArr;
                rItems = rItems.splice(0, Math.min(8, rItems.length));
                rItems = rItems.sort(bySalesRank).splice(0, Math.min(maxProductsPerBucket, rItems.length));
            } catch (err) {
                rItems = 'SHIT';
            }

            // now add image if it's not there and price if no list price
            for (var j = 0; j < rItems.length; j++) {
                rItems[j] = replacePrice(rItems[j]);
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
                var response = {
                    // return results sorted by minPrice (which is always a number)
                    buckets: items.sort(function(a,b){
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
                    // original: origResult
                };
                if ((typeof node === 'undefined') && (typeof brand === 'undefined') && (index === 'All')) {
                    cache.put(cacheKey, response, 1*60*60*1000); // 1 hours
                }
                res.json(response);
            }
        });
    }

    function getResultsForItems(itemIDs, idx) {
        prodAdv.call("ItemLookup", {
                // ItemId is a comma-delimited list of ASINS
                ItemId: itemIDs.join(','),
                ResponseGroup: 'Reviews,SalesRank,Images,OfferSummary,EditorialReview,ItemAttributes',
            }, function(err, itemResult) {

                if (itemResult.Items === undefined || itemResult.Items.Item === undefined) {
                    console.log("[ERR] No items to show.");
                    res.json({
                        buckets: {
                        },
                        narrowNodes: []
                    });
                    return;
                }

                itemResult.Items.Item = arrayIfNot(itemResult.Items.Item);
                // we need to pslit them up based on hardcoded price brackets

                for (var i = 0; i < itemResult.Items.Item.length; i++) {
                    itemResult.Items.Item[i] = replacePrice(itemResult.Items.Item[i]);
                    // also remove the item if it doesn't have reviews
                    if (itemResult.Items.Item[i].CustomerReviews.HasReviews === 'false') {
                        itemResult.Items.Item.splice(i, 1);
                    }
                }

                // console.log(itemResult.Items.Item);

                // -> hashed on minPrice (*100 because that makes cents)
                var brackets = {
                    0: [],
                    500: [],
                    1000: [],
                    1500: [],
                    2000: [],
                    2500: [],
                    3000: [],
                    3500: [],
                    4000: [],
                    5000: [],
                    10000: [],
                    15000: [],
                    20000: [],
                    25000: [],
                    30000: [],
                    35000: [],
                    40000: [],
                    45000: [],
                    50000: [],
                    55000: [],
                    60000: []
                };
                var keys = Object.keys(brackets);

                if (indexSpecific[idx].shouldBracket) {

                    // console.log(itemResult.Items.Item.map(function(item){return item.ItemAttributes.ListPrice || undefined;}));

                    for (var n = 0; n < itemResult.Items.Item.length; n++) {
                        // so for each item, put it in the correct bracket
                        for (var j = keys.length; j >=0; j--) {
                            var k = parseInt(keys[j], 10);
                            if ((itemResult.Items.Item[n].OfferSummary !== undefined && itemResult.Items.Item[n].OfferSummary.LowestNewPrice !== undefined) && (parseInt(itemResult.Items.Item[n].OfferSummary.LowestNewPrice.Amount, 10) > k)) {
                                brackets[k].push(itemResult.Items.Item[n]);
                                break;
                            }
                        }
                    }
                } else {
                    brackets['0'] = itemResult.Items.Item;
                }
                // sweet, now order those by SalesRank and only return the first two
                items = [];
                for (var m = 0; m < keys.length; m++) {
                    var ky = parseInt(keys[m], 10);
                    items.push({
                        items: brackets[ky].sort(bySalesRank).splice(0, Math.min(maxProductsPerBucket, brackets[ky].length)),
                        minPrice: ky,
                        maxPrice: parseInt(keys[m+1], 10) || 'inf'
                    });
                }

                var response = {
                    buckets: items,
                    narrowNodes: nodes
                };

                if ((typeof node === 'undefined') && (typeof brand === 'undefined') && (index === 'All')) {
                    cache.put(cacheKey, response, 1*60*60*1000); // 1 hours
                }

                res.json(response);
            }
        );
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
                Sort: indexSpecific[index].sort,
                MerchantId: onlyAmazon ? 'Amazon' : undefined
            }, function(err, result) {
                // if we didn't get a price searchbin, preset the user with the currect results and the option to refine the search

                // save original Result for debugging
                // origResult = result;
                // console.log(result);

                if (result.Items === undefined || result.Items.Item === undefined) {
                    res.json({
                        buckets: {
                        },
                        narrowNodes: []
                    });
                    return;
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
                    } else if ((sets[i]['@'].NarrowBy === 'PriceRange') && indexSpecific[index].shouldBracket) {
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
                                // Sort: indexSpecific[index].sort,
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

                if (!didGetPriceRange || !indexSpecific[index].shouldBracket) {
                    // this means we didn't get a pricebin for a specific index,
                    // which annoys me greatly
                    // like, wtf Amazon, be consistent.

                    // so we're going to fudge it
                    var itemIDs = result.Items.Item.splice(0, Math.min(10, result.Items.Item));
                    itemIDs = result.Items.Item.map(function(item) {
                        return item.ASIN;
                    });
                    getResultsForItems(itemIDs, index);
                }
            }
        );
    } else {
        // is ALL, therefore, make the call and do a batch ItemLookup on the returned results;
        prodAdv.call("ItemSearch", {
                SearchIndex: index,
                Keywords: query,
                // we want the PriceRange SearchBin, which is within SearchBins
                ResponseGroup: 'SearchBins',
                BrowseNode: node,
                Brand: brand,
                // we only want Available items
                Availability: 'Available',
                // sort by relevance or sales, not rating yet
                Sort: indexSpecific[index].sort,
                MerchantId: onlyAmazon ? 'Amazon' : undefined
            }, function(err, result) {
                // assume that this type of query can only respond with one

                if (result.Items !== undefined && result.Items.SearchBinSet !== undefined && result.Items.SearchBinSets.SearchBinSet) {
                    nodes = arrayIfNot(result.Items.SearchBinSets.SearchBinSet);
                } else {
                    nodes = [];
                }
                if (typeof result.Items === 'undefined') {
                    return;
                }
                result.Items.Item = arrayIfNot(result.Items.Item);
                // we only care about the first 10 cause the API limits us to 10 in an ItemLookup
                var itemIDs = result.Items.Item.splice(0, Math.min(10, result.Items.Item));
                itemIDs = result.Items.Item.map(function(item) {
                    return item.ASIN;
                });
                getResultsForItems(itemIDs, index);
            }
        );
    }
};