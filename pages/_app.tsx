import React from 'react';
import { AppProps } from 'next/app';

import '../styles/_main.css';
import Head from 'next/head';
import { HOST_URL, META_DESCRIPTION, META_NAME, TWITTER_AUTHOR } from '../lib/constants';

const absoluteUri = (path: string) => `${HOST_URL}${path}`;

function Fivestar({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>
          {META_NAME} | {META_DESCRIPTION}
        </title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content={META_DESCRIPTION} />

        <meta property="name" content={META_NAME} />
        <meta property="description" content={META_DESCRIPTION} />
        <meta property="image" content={absoluteUri('/banner.png')} />

        <meta name="twitter:title" content={META_NAME} />
        <meta name="twitter:description" content={META_DESCRIPTION} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content={TWITTER_AUTHOR} />
        <meta name="twitter:image:src" content={absoluteUri('/banner.png')} />

        <meta property="og:title" content={META_NAME} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={HOST_URL} />
        <meta property="og:image" content={absoluteUri('/banner.png')} />
        <meta property="og:description" content={META_DESCRIPTION} />
        <meta property="og:site_name" content={META_NAME} />

        <meta name="viewport" content="width=device-width" />
      </Head>

      <div className="flex-grow flex flex-col relative antialiased font-sans text-gray-700">
        <Component {...pageProps} />
      </div>

      <style jsx global>{`
        body {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        #__next {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </>
  );
}

export default Fivestar;
