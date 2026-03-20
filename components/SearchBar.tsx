'use client';

import { useState, FormEvent } from 'react';

export type SearchType = 'name' | 'description' | 'both';

interface SearchBarProps {
  onSearch: (query: string, searchType: SearchType) => void;
  initialValue?: string;
  initialType?: SearchType;
}

export function SearchBar({ onSearch, initialValue = '', initialType = 'name' }: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [searchType, setSearchType] = useState<SearchType>(initialType);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(query, searchType);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search cards..."
        className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
      />
      <select
        value={searchType}
        onChange={(e) => setSearchType(e.target.value as SearchType)}
        className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        <option value="name">Name</option>
        <option value="description">Card text</option>
        <option value="both">Both</option>
      </select>
      <button
        type="submit"
        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
      >
        Search
      </button>
    </form>
  );
}
