export interface SearchResponse {
  searchUrl: string; // link to this search on amazon
  query: string; // the original query
  buckets: Bucket[];
}

export interface Bucket {
  minPrice: number; // the minimum price in this bucket, used as a key
  items: Item[];
}

export interface Item {
  title: string; // title
  maker: string; // subtitle
  imageUrl: string; // image
  detailPageUrl: string; // detail page
  priceDisplayAmount: string; // price
}
