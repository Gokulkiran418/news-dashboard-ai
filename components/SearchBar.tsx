import React from 'react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  isSearching: boolean;
}

const SearchBar: React.FC<SearchBarProps> = React.memo(
  ({ searchTerm, onSearchChange, onSearchSubmit, isSearching }) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onSearchSubmit();
      }
    };

    return (
      <div className="flex items-center mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search news..."
          className="flex-grow p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-400"
          disabled={isSearching}
          aria-label="Search news"
        />
        <button
          onClick={onSearchSubmit}
          disabled={isSearching}
          className="p-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600"
          aria-label="Submit search"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>
    );
  }
);

export default SearchBar;