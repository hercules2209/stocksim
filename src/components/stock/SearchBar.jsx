// SearchBar.jsx
import React, { useState, useEffect, useRef } from 'react';
import './SearchBar.css';

function SearchBar({ onSearch, onAutoComplete }) {
  const [ticker, setTicker] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setTicker(value);

    if (value.length > 0) {
      const results = await onAutoComplete(value);
      setSuggestions(results);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setTicker(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
    onSearch(suggestion);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ticker.trim()) {
      onSearch(ticker.trim().toUpperCase());
      setShowSuggestions(false);
    }
  };

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSubmit} className="search-bar">
        <input
          type="text"
          value={ticker}
          onChange={handleInputChange}
          placeholder="Enter stock ticker"
          className="search-input"
        />
        <button type="submit" className="search-button">Search</button>
      </form>
      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions-list" ref={suggestionsRef}>
          {suggestions.map((suggestion, index) => (
            <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBar;