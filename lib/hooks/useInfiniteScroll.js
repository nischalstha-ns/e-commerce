import { useState, useEffect, useCallback } from 'react';

export function useInfiniteScroll(fetchMore, hasMore = true) {
  const [isFetching, setIsFetching] = useState(false);

  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || isFetching || !hasMore) {
      return;
    }
    setIsFetching(true);
  }, [isFetching, hasMore]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (!isFetching) return;
    fetchMore().finally(() => setIsFetching(false));
  }, [isFetching, fetchMore]);

  return [isFetching, setIsFetching];
}