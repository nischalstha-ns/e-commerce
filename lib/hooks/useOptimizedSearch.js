import { useState, useEffect, useMemo } from 'react';
import { debounce } from '@/lib/utils/debounce';
import { cache } from '@/lib/utils/cache';

export function useOptimizedSearch(searchFunction, delay = 300) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const debouncedSearch = useMemo(
    () => debounce((searchQuery) => {
      setDebouncedQuery(searchQuery);
    }, delay),
    [delay]
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const cacheKey = `search:${debouncedQuery}`;
    
    if (cache.has(cacheKey)) {
      setResults(cache.get(cacheKey));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    searchFunction(debouncedQuery)
      .then((data) => {
        setResults(data || []);
        cache.set(cacheKey, data || [], 300000); // 5 minutes
      })
      .catch((err) => {
        setError(err);
        setResults([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [debouncedQuery, searchFunction]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    clearResults: () => setResults([])
  };
}