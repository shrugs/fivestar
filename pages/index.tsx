import React, { useCallback, useMemo, useEffect } from 'react';
import Head from 'next/head';
import Facebook from '../icons/Facebook';
import Twitter from '../icons/Twitter';
import { useAsync } from 'react-async';
import FlipMove from 'react-flip-move';
import noop from 'lodash/noop';
import { META_NAME, POPULAR_TERMS, SHARE_TEXT } from '../lib/constants';
import Loading from '../icons/Loading';
import { SearchResponse } from '../lib/types';
import ReactGA from 'react-ga';
import { buildFacebookShareUrl, buildTwitterShareUrl } from '../lib/shareUrls';
import useQueryParams from '../lib/useQueryParams';
import { useDebouncedCallback } from 'use-debounce';

const formatUSD = (price: number) => `$${(price / 100).toFixed(2)}`;
const queryIsValid = (query: string) => query.length > 0;
const twitterShareUrl = buildTwitterShareUrl(SHARE_TEXT);
const facebookShareUrl = buildFacebookShareUrl(SHARE_TEXT);

const fetchSearch = async ({ query }) => {
  if (!queryIsValid(query)) return undefined;

  const res = await fetch(`/api/search?${new URLSearchParams({ q: query })}`);
  let data;
  try {
    data = await res.json();
  } catch (error) {
    throw new Error(res.statusText);
  }

  if (!res.ok) {
    throw new Error(data.message);
  }
  return data;
};

// TODO: social link generation

function Home() {
  const [{ q }, setParams] = useQueryParams();
  const query = q || ''; // coerce undefined to empty string

  const setQuery = useCallback((query: string) => setParams({ q: query }), [setParams]);
  const isValidQuery = queryIsValid(query);
  const queryIsEmpty = !isValidQuery; // todo:
  const canSearch = isValidQuery;

  const { data, error, isPending, isFulfilled, reload, setData } = useAsync<SearchResponse>({
    promiseFn: fetchSearch,
    query,
    debugLabel: '/api/search',
  });

  const showResults = !isPending && isFulfilled && data && isValidQuery;
  const showPopularTerms = queryIsEmpty || (isValidQuery && !showResults);
  const showPending = isPending;
  const showError = error && !isPending;

  const [handleSearch] = useDebouncedCallback(
    useCallback(() => {
      ReactGA.event({
        category: 'Search',
        action: 'search',
        label: query,
      });
      1;

      reload();
    }, [query, reload]),
    250,
  );

  const onSearchChange = useCallback(e => setQuery(e.target.value), [setQuery]);
  const onSearchKeydown = useCallback(e => e.key === 'Enter' && handleSearch(), [handleSearch]);
  const handleClearSearch = useCallback(() => setQuery(''), [setQuery]);

  const searchFor = useCallback(
    (query: string) => () => {
      setQuery(query);
      // wait for setState to flush...
      setTimeout(handleSearch, 0);
    },
    [handleSearch, setQuery],
  );

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  useEffect(() => {
    // if we can search on initial mount, use existing query params
    if (canSearch) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // if query is empty, nuke search state
    if (queryIsEmpty) {
      setData(undefined);
    }
  }, [queryIsEmpty, setData]);

  return (
    <>
      <Head>
        {canSearch && (
          <title>
            🔎 for {query} on {META_NAME}
          </title>
        )}
      </Head>

      <div className="flex-grow flex flex-col px-2 py-4 w-full max-w-6xl mx-auto">
        <header className="h-12 mx-4 flex flex-row justify-between items-center">
          <img
            src="/fivestar_logo_black_2x.png"
            className="h-full cursor-pointer"
            onClick={handleClearSearch}
          ></img>
          <div className="flex flex-row items-center">
            <a href={facebookShareUrl} rel="noopener noreferrer" target="_blank">
              <Facebook className="ml-4 rounded-full hover:shadow focus:shadow cursor-pointer" />
            </a>
            <a href={twitterShareUrl} rel="noopener noreferrer" target="_blank">
              <Twitter className="ml-4 rounded-full hover:shadow focus:shadow cursor-pointer" />
            </a>
          </div>
        </header>

        <main className="flex-grow mt-12 flex flex-col md:w-2/3 md:mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl text-center">
            The <strong>Secret</strong> Amazon Search
          </h2>
          <h3 className="mb-8 text-xs sm:text-base text-gray-600 text-center">
            Find the best products on Amazon with <strong>confidence</strong>.
          </h3>

          <div className="flex flex-row shadow rounded">
            <input
              className="flex-grow py-4 pl-4 rounded-l"
              type="text"
              value={query}
              placeholder="What do you need right now?"
              onChange={onSearchChange}
              onKeyDown={canSearch ? onSearchKeydown : noop}
              autoFocus
            ></input>
            <button
              className="uppercase hover:bg-gray-100 focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none text-sm p-4"
              onClick={canSearch ? handleSearch : noop}
              disabled={!canSearch}
            >
              search
            </button>
          </div>

          <FlipMove className="my-4 flex flex-row flex-wrap">
            {showPopularTerms &&
              POPULAR_TERMS.map(term => (
                <div
                  key={term}
                  className="text-xs font-semibold leading-none rounded bg-gray-100 hover:bg-gray-200 py-2 px-2 mr-2 mb-2 cursor-pointer"
                  onClick={searchFor(term)}
                >
                  {term}
                </div>
              ))}
          </FlipMove>

          <FlipMove className="flex-grow flex flex-col">
            {showError && (
              <p className="text-center text-red-600 font-semibold">
                {error.message} — Too many people are using {META_NAME} at the moment. Try again in
                a few minutes.
              </p>
            )}

            {showPending && (
              <div className="flex-grow flex flex-col justify-center items-center">
                <Loading />
              </div>
            )}

            {showResults &&
              data.buckets.map((bucket, i) => {
                const minPrice = bucket.minPrice;
                const maxPrice =
                  data.buckets.length - 1 > i //
                    ? data.buckets[i + 1].minPrice
                    : undefined;

                return (
                  <div key={bucket.minPrice} className="flex flex-col">
                    <h4 className="text-2xl font-light my-4">
                      {maxPrice ? (
                        <>
                          👇 <strong>{formatUSD(maxPrice)}</strong> and under
                        </>
                      ) : (
                        <>
                          💸 over <strong>{formatUSD(minPrice)}</strong>
                        </>
                      )}
                    </h4>
                    <div className="flex flex-row flex-wrap">
                      {bucket.items.map(item => (
                        <a
                          key={item.detailPageUrl}
                          href={item.detailPageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cursor-pointer block w-full md:w-64 md:mr-4"
                        >
                          <div className="rounded shadow hover:shadow-md flex flex-col mb-4">
                            <div
                              className="h-32 bg-no-repeat bg-top bg-contain"
                              style={{ backgroundImage: `url(${item.imageUrl})` }}
                            ></div>
                            <div className="p-4">
                              <p className="text-base font-bold">{item.priceDisplayAmount}</p>
                              <p className="text-base truncate">{item.title}</p>
                              <p className="text-xs truncate">from {item.maker}</p>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })}
          </FlipMove>

          {showResults && (
            <span className="mt-4">
              Can't find what you're looking for?{' '}
              <a
                className="text-base underline"
                href={data.searchUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                See more results for '{data.query}' on Amazon.com
              </a>
            </span>
          )}
        </main>
      </div>

      <footer className="bg-gray-700 px-2 py-4 mt-8 text-white flex flex-col text-xs">
        <div className="md:w-2/3 md:mx-auto">
          <p className="mb-1 font-bold">
            Fivestar is an Amazon Associate, and all links to Amazon are referrals.
          </p>
          <p className="mb-1">
            Fivestar's search algorithm finds the best products by first searching for relevancy and{' '}
            <i>then</i> aggregating by average customer reviews. It's smarter and faster than
            searching directly on Amazon. Don't spend minutes reading reviews and deciding between
            products—find what you're looking for with confidence.
          </p>
          <p className="mb-1">Fivestar searches the USA www.amazon.com marketplace in USD.</p>
          <p>&copy; {currentYear}, Fivestar — est. 2015</p>
        </div>
      </footer>

      <style jsx>{`
        .aspect {
          padding-bottom: 56.25%;
        }
      `}</style>
    </>
  );
}

// noop getInitialProps so that we opt-out of static rendering and we can SSR parse query parameters
Home.getInitialProps = async () => ({});

export default Home;
