# FiveStar

FiveStar finds the best Amazon product in a domain, broken down by budget. Save yourself literally seconds when you want the best version of a generic product.

It was covered by [TechCrunch](http://techcrunch.com/2014/06/03/fivestar-finds-the-best-products-on-amazon-from-any-category-on-any-budget/)

## Install

Runs on node 6.9.1 or similar.

1. Clone the repo
2. Create a `.env` with valid amazon product advertising credentials
```
PRODUCT_ADVERTISING_ACCESS_KEY=
PRODUCT_ADVERTISING_SECRET_KEY=
PRODUCT_ADVERTISING_TRACKING_ID=
```
2. `npm i`
3. `npm start` runs the api server
4. `npm run dev` runs the webpack dev server for serving the frontend
5. visit `localhost:3000` to see everything working
6. `npm run prod` builds the frontend into a bundle. always run this before deploying anywhere
7. Note, I haven't actually tested this process from scratch, so I might have skipped an obvious step.

