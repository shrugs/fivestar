import { NextApiRequest, NextApiResponse } from 'next';
import PAAPI from 'paapi5-nodejs-sdk';
import { promisify } from 'util';
import get from 'lodash/get';
import map from 'lodash/map';
import findLast from 'lodash/findLast';
import { Bucket, SearchResponse, Item } from '../../lib/types';

// -> price in usd (*100 because that makes cents)
const BUCKET_PRICES = [
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
];

// configure PAAPI client
const client = PAAPI.ApiClient.instance;
client.accessKey = process.env.PAAPI_ACCESS_KEY;
client.secretKey = process.env.PAAPI_SECRET_KEY;
client.host = 'webservices.amazon.com';
client.region = 'us-east-1';

// create a default api client
const paapi = new PAAPI.DefaultApi();
// promisify the searchItems function because it's 2020 amazon
const searchItems = promisify(paapi.searchItems.bind(paapi));

const buildSearchItemsRequest = (keywords: string) => {
  const request = new PAAPI.SearchItemsRequest();

  request['PartnerTag'] = process.env.PAAPI_PARTNER_TAG;
  request['PartnerType'] = 'Associates'; // only valid value
  request['Keywords'] = keywords;
  request['SearchIndex'] = 'All'; // default
  request['Availability'] = 'Available'; // default
  request['SortBy'] = 'Relevance'; // we sort by sales rank later
  request['Merchant'] = 'All'; // default
  request['Marketplace'] = 'www.amazon.com'; // default
  request['CurrencyOfPreference'] = 'USD'; // default for www.amazon.com
  // request['DeliveryFalgs'] = ''; // we may want to restrict delivery types in the future
  request['Resources'] = [
    'ItemInfo.Title', // title
    'Images.Primary.Large', // image
    'ItemInfo.ByLineInfo', // brand/manufacturer
    'BrowseNodeInfo.WebsiteSalesRank', // sales rank
    'Offers.Listings.Price', // listing price
    'Offers.Listings.IsBuyBoxWinner', // determine the winning listing
    'Offers.Summaries.LowestPrice', // lowest price in offers
  ];

  return request;
};

const getWinningListing = (item: any): any =>
  (get(item, ['Offers', 'Listings'], []) as any[]) //
    .find(listing => get(listing, ['IsBuyBoxWinner'], false));

const getPrice = (item: any): number => {
  const winningListing = getWinningListing(item);
  const listingPrice = get(winningListing, ['Price', 'Amount']);

  if (!listingPrice) {
    throw new Error(`No winning Listing in ${JSON.stringify(item)}`);
  }

  return listingPrice * 100; // convert to cents
};

const formatToResponseItem = (item: any): Item => {
  return {
    title: get(item, ['ItemInfo', 'Title', 'DisplayValue']),
    maker: get(item, ['ItemInfo', 'ByLineInfo', 'Brand', 'DisplayValue'], 'Unknown'),
    detailPageUrl: get(item, ['DetailPageURL']),
    imageUrl: get(item, ['Images', 'Primary', 'Large', 'URL'], '/no_image.jpg'),
    priceDisplayAmount: get(getWinningListing(item), ['Price', 'DisplayAmount']),
  };
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const query = req.query.q as string;
  if (!query) {
    throw new Error('Expected `q` parameter, got nothing.');
  }

  const request = buildSearchItemsRequest(query);
  let data: any;
  try {
    data = await searchItems(request);
  } catch (error) {
    return res.status(500).json({ message: `Error from Amazon: ${error.message}` });
  }
  const searchUrl: string = get(data, ['SearchResult', 'SearchURL']);
  const Items: any[] = get(data, ['SearchResult', 'Items'], []);

  const bucketsByPrice = Items.reduce<Record<number, Item[]>>((memo, item) => {
    try {
      const itemPrice = getPrice(item);
      // find the correct bucket given the price
      const bucketPrice = findLast(BUCKET_PRICES, bp => itemPrice > bp).toString();

      const responseItem = formatToResponseItem(item);
      if (memo[bucketPrice]) {
        memo[bucketPrice].push(responseItem);
      } else {
        memo[bucketPrice] = [responseItem];
      }
    } catch {} // ignore an item if errors thrown in getPrice, etc

    return memo;
  }, {});

  const buckets: Bucket[] = map(bucketsByPrice, (value, key) => ({
    minPrice: parseInt(key, 10), // TODO: this is annoying, but we need to key by number...
    items: value,
  }));

  const response: SearchResponse = {
    searchUrl,
    buckets,
    query,
  };

  return res.status(200).json(response);
};
