import { HOST_URL } from './constants';

/* eslint-disable @typescript-eslint/camelcase */
export const buildTwitterShareUrl = (text: string) =>
  `https://twitter.com/intent/tweet?${new URLSearchParams({ text })}`;

export const buildFacebookShareUrl = (text: string) =>
  `https://www.facebook.com/dialog/feed?${new URLSearchParams({
    app_id: '740195929372066',
    display: 'page',
    link: HOST_URL,
    redirect_uri: process.browser ? window.location.href : HOST_URL,
  })}`;
