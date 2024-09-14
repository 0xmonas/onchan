import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { useDarkMode } from '../contexts/DarkModeContext';
import { usePrivyWeb3 } from '../contexts/PrivyWeb3Context';
import { useSearchSuggestions } from '../hooks/useSearchSuggestions';
import { MagnifyingGlassIcon, Cross1Icon } from "@radix-ui/react-icons";
import { UpdateIcon } from "@radix-ui/react-icons";



export default function SearchBar({ 
  onSearch, 
  isMobile = false,
  isOpen = true,
  onClose,
  className = '',
  inputClassName = '',
  placeholder = "Search @users, titles, #entries",
  onFocus,
  onBlur
}) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { suggestions, isLoading, error, fetchSuggestions } = useSearchSuggestions();
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const { authenticated } = usePrivyWeb3();
  const searchBarRef = useRef(null);

  useEffect(() => {
    if (query.length > 0) {
      fetchSuggestions(query);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [query, fetchSuggestions]);

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
    onSearch(sanitizedQuery);
  };

  const clearSearch = () => {
    setQuery('');
    setShowSuggestions(false);
    onSearch('');
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
    if (isMobile && onClose) {
      onClose();
    }
  }, [router, authenticated, query, isMobile, onClose]);

  const searchBarContent = (
    <div className={`relative z-[54] w-full ${className}`} ref={searchBarRef}>
      <div className="relative flex items-center h-full">
        <MagnifyingGlassIcon className="absolute left-3 text-muted-foreground pointer-events-none" size={16} />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => onFocus && onFocus()}
          onBlur={() => onBlur && onBlur()}
          placeholder={placeholder}
          className={`w-full pl-9 pr-3 rounded-full focus:outline-none transition-colors duration-200 ${
            isDarkMode
              ? `bg-black border-secondary text-secondary-foreground placeholder-secondary-foreground/50` 
              : `bg-white text-foreground placeholder-foreground/50`
          } border border-input ${inputClassName}`}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <Cross1Icon size={16} />
          </button>
        )}
      </div>
      {isLoading && (
  <div className="absolute right-10 top-1/2 transform -translate-y-1/2 flex items-center text-muted-foreground">
    <UpdateIcon className="animate-spin mr-2 h-4 w-4" />
    <span className="text-xs">Loading...</span>
  </div>
)}
      {error && <div className="text-destructive mt-1 text-xs">{error}</div>}
      {showSuggestions && suggestions.length > 0 && (
        <div className={`absolute w-full mt-1 rounded-md shadow-lg ${
          isDarkMode ? "bg-popover" : "bg-white"
        } border border-input max-h-48 overflow-y-auto`}>
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.type}-${suggestion.id || index}`}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`p-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors duration-200 text-sm`}
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

  if (isMobile) {
    return isOpen ? (
      <div className={`fixed inset-x-0 top-0 ${isDarkMode ? "bg-black" : "bg-white"} border-b border-border`}>
        <div className="container mx-auto flex items-center h-[75px] px-4">
          <div className="flex-grow mr-2">
            {searchBarContent}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close search"
          >
            <Cross1Icon className="w-6 h-6" />
          </button>
        </div>
      </div>
    ) : null;
  }

  return searchBarContent;
}