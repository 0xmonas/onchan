// hooks/useSearchSuggestions.js
import { useState, useCallback, useRef, useEffect } from 'react';
import { searchSuggestions } from '../services/searchService';
import { debounce } from 'lodash';

export function useSearchSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSuggestionsRef = useRef(async (searchQuery) => {
    if (searchQuery.length > 0) {
      setIsLoading(true);
      setError(null);
      try {
        const results = await searchSuggestions(searchQuery, 1, 10);
        console.log("Received suggestions:", results);
        setSuggestions(results);
      } catch (error) {
        console.error('Search suggestion error:', error);
        setError('Failed to fetch suggestions. Please try again.');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSuggestions([]);
    }
  });

  const debouncedFetchSuggestionsRef = useRef(null);

  useEffect(() => {
    debouncedFetchSuggestionsRef.current = debounce(
      (searchQuery) => fetchSuggestionsRef.current(searchQuery),
      300
    );

    return () => {
      if (debouncedFetchSuggestionsRef.current) {
        debouncedFetchSuggestionsRef.current.cancel();
      }
    };
  }, []);

  const fetchSuggestions = useCallback((searchQuery) => {
    if (debouncedFetchSuggestionsRef.current) {
      debouncedFetchSuggestionsRef.current(searchQuery);
    }
  }, []);

  return { suggestions, isLoading, error, fetchSuggestions };
}