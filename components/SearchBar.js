import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { useDarkMode } from '../contexts/DarkModeContext';
import { searchSuggestions } from '../services/searchService';
import { usePrivyWeb3 } from '../contexts/PrivyWeb3Context';
import Link from 'next/link';
import { debounce } from 'lodash';
import { Search } from 'lucide-react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const { authenticated } = usePrivyWeb3();
  const searchBarRef = useRef(null);

  const fetchSuggestions = useCallback(async (searchQuery) => {
    if (searchQuery.length > 0) {
      setIsLoading(true);
      setError(null);
      try {
        console.log("Fetching suggestions for query:", searchQuery);
        const results = await searchSuggestions(searchQuery, 1, 10);
        console.log("Received suggestions:", results);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Search suggestion error:', error);
        setError('Failed to fetch suggestions. Please try again.');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

  const debouncedFetchSuggestions = useCallback(
    (searchQuery) => {
      const debouncedFn = debounce(() => {
        fetchSuggestions(searchQuery);
      }, 300);
      debouncedFn();
      return () => debouncedFn.cancel();
    },
    [fetchSuggestions]
  );
  
  useEffect(() => {
    if (query.length > 0) {
      const cleanup = debouncedFetchSuggestions(query);
      return cleanup;
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, debouncedFetchSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const sanitizedQuery = e.target.value.replace(/[<>&'"]/g, '');
    setQuery(sanitizedQuery);
  };

  const handleSuggestionClick = useCallback((suggestion) => {
    console.log("Suggestion clicked:", suggestion);
    switch (suggestion.type) {
      case 'user':
        router.push(`/profile/${encodeURIComponent(suggestion.username)}`);
        break;
      case 'title':
        router.push(`/title/${encodeURIComponent(suggestion.id)}`);
        break;
      case 'entry':
        router.push(`/entry/${encodeURIComponent(suggestion.id)}`);
        break;
      case 'createTitle':
        if (authenticated) {
          router.push(`/create-title?name=${encodeURIComponent(query)}`);
        } else {
          alert('Please connect your wallet to create a new title.');
        }
        break;
      case 'registerUser':
        if (authenticated) {
          router.push(`/register?username=${encodeURIComponent(suggestion.text.split('@')[1])}`);
        } else {
          alert('Please connect your wallet to register a new user.');
        }
        break;
      default:
        console.error('Unknown suggestion type:', suggestion.type);
    }
    setQuery('');
    setShowSuggestions(false);
  }, [router, authenticated, query]);

  const handleInputFocus = () => {
    if (query.trim().length > 0 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="relative w-full" ref={searchBarRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder="Search @users, titles, #entries"
          className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base rounded-full focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-200 ${
            isDarkMode 
              ? "bg-black border secondary text-secondary-foreground placeholder-secondary-foreground/50" 
              : "bg-background text-foreground placeholder-foreground/50"
          } border border-input`}
          aria-label="Search"
        />
        <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
      </div>
      {isLoading && <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xs sm:text-sm">Loading...</div>}
      {error && <div className="text-destructive mt-1 sm:mt-2 text-xs sm:text-sm">{error}</div>}
      {showSuggestions && suggestions.length > 0 && (
        <div className={`absolute z-20 w-full mt-1 rounded-md shadow-lg ${
          isDarkMode ? "bg-popover" : "bg-background"
        } border border-input max-h-48 sm:max-h-60 overflow-y-auto`}>
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.type}-${suggestion.id || index}`}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`p-1.5 sm:p-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors duration-200 text-xs sm:text-sm md:text-base`}
            >
              {suggestion.type === 'user' && <span>@{suggestion.username}</span>}
              {suggestion.type === 'title' && <span>{suggestion.text}</span>}
              {suggestion.type === 'entry' && <span>#{suggestion.id}</span>}
              {suggestion.type === 'createTitle' && <span>{suggestion.text}</span>}
              {suggestion.type === 'registerUser' && <span>{suggestion.text}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}