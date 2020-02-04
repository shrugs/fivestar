import { useRouter } from 'next/router';
import Router from 'next/router';
import { useState, useCallback, useEffect } from 'react';

export default function useQueryParams(): [
  Record<string, string>,
  (value: Record<string, string>) => void,
] {
  const router = useRouter();

  const [query, _setQuery] = useState(() => router.query as Record<string, string>);

  const setQuery = useCallback(
    (values: Record<string, string>) => {
      const url = `${window.location.pathname}?${new URLSearchParams(values)}`;
      router.replace(url, url, { shallow: true });
      _setQuery(values);
    },
    [router],
  );

  useEffect(() => {
    const routeChangeComplete = (url: string) => {
      _setQuery(Router.query as Record<string, string>);
    };

    Router.events.on('routeChangeComplete', routeChangeComplete);
    return () => {
      Router.events.off('routeChangeComplete', routeChangeComplete);
    };
  }, []);

  return [query, setQuery];
}
