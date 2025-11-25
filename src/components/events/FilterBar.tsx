import { FILTER_TAXONOMIES, DATE_FILTER_OPTIONS } from '../../lib/taxonomyMap';
import type { DateFilter } from '../../types/events';

interface FilterBarProps {
  selectedTaxonomy: string;
  onTaxonomyChange: (taxonomy: string) => void;
  selectedDateFilter: DateFilter;
  onDateFilterChange: (filter: DateFilter) => void;
  className?: string;
}

export function FilterBar({
  selectedTaxonomy,
  onTaxonomyChange,
  selectedDateFilter,
  onDateFilterChange,
  className = '',
}: FilterBarProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Date Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <span className="text-sm text-gray-500 font-medium flex-shrink-0">When:</span>
        <div className="flex gap-2">
          {DATE_FILTER_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => onDateFilterChange(option.id as DateFilter)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                transition-all duration-200 whitespace-nowrap
                ${selectedDateFilter === option.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'bg-surface-light text-gray-300 hover:bg-surface-light/80 hover:text-white border border-white/5'
                }
              `}
            >
              <span>{option.icon}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <span className="text-sm text-gray-500 font-medium flex-shrink-0">Category:</span>
        <div className="flex gap-2">
          {FILTER_TAXONOMIES.map((taxonomy) => (
            <button
              key={taxonomy.id}
              onClick={() => onTaxonomyChange(taxonomy.id)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                transition-all duration-200 whitespace-nowrap
                ${selectedTaxonomy === taxonomy.id
                  ? 'bg-accent text-dark-950 shadow-lg shadow-accent/25'
                  : 'bg-surface-light text-gray-300 hover:bg-surface-light/80 hover:text-white border border-white/5'
                }
              `}
            >
              <span>{taxonomy.icon}</span>
              <span>{taxonomy.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FilterBar;

