import { useState, useCallback } from 'react';
import { Input } from '../ui';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
  className?: string;
}

function SearchIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function ClearIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export function SearchBar({ 
  value, 
  onChange, 
  onSearch, 
  placeholder = 'Search events, artists, venues...',
  className = '',
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  }, [onSearch]);

  const handleClear = useCallback(() => {
    onChange('');
    onSearch();
  }, [onChange, onSearch]);

  return (
    <div className={`relative ${className}`}>
      <div className={`
        relative flex items-center transition-all duration-200
        ${isFocused ? 'ring-2 ring-primary/50' : ''}
        rounded-xl overflow-hidden
      `}>
        {/* Search Icon */}
        <div className="absolute left-4 z-10">
          <SearchIcon className={`w-5 h-5 transition-colors ${isFocused ? 'text-primary' : 'text-gray-400'}`} />
        </div>

        {/* Input */}
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="pl-12 pr-12 py-4 text-base bg-surface/80 backdrop-blur-sm border-white/10 focus:border-primary/50"
        />

        {/* Clear button */}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Clear search"
          >
            <ClearIcon className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchBar;

