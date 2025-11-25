import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { searchEvents } from '../../services/api';
import { 
  getTonightRange, 
  getTomorrowRange, 
  getWeekendRange, 
  getWeekRange, 
  getMonthRange 
} from '../../lib/dateUtils';
import { Button } from '../../components/ui';
import { SearchBar, FilterBar, EventList } from '../../components/events';
import type { Event, DateFilter, DiscoveryFilters } from '../../types/events';

function BackIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}

function ViewGridIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function ViewListIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  );
}

function getDateRange(filter: DateFilter): { start?: string; end?: string } {
  switch (filter) {
    case 'tonight':
      return getTonightRange();
    case 'tomorrow':
      return getTomorrowRange();
    case 'weekend':
      return getWeekendRange();
    case 'week':
      return getWeekRange();
    case 'month':
      return getMonthRange();
    default:
      return {};
  }
}

export function Discover() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { preferences } = useUser();

  // Get initial filter from URL params
  const initialDateFilter = (searchParams.get('when') as DateFilter) || 'week';
  const initialTaxonomy = searchParams.get('category') || '';
  const initialQuery = searchParams.get('q') || '';

  // State
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<DiscoveryFilters>({
    query: initialQuery,
    taxonomy: initialTaxonomy,
    dateFilter: initialDateFilter,
  });

  // Fetch events
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const dateRange = getDateRange(filters.dateFilter);
      
      // Use user's location from preferences
      const city = preferences?.location?.city;
      const state = preferences?.location?.state;

      // Use the selected taxonomy filter directly
      // When "All Events" is selected (empty string), don't apply any taxonomy filter
      // This ensures we get ALL events, not filtered by user interests
      // (SeatGeek treats comma-separated taxonomies as AND, not OR, so sending
      // multiple interests like "concert,sports" would return 0 results)
      const taxonomy = filters.taxonomy || undefined;

      const result = await searchEvents({
        q: filters.query || undefined,
        city: city || undefined,
        state: state || undefined,
        date_from: dateRange.start,
        date_to: dateRange.end,
        taxonomy,
        per_page: 30,
        min_price: preferences?.budgetRange?.min,
        max_price: preferences?.budgetRange?.max,
      });

      if (result.success) {
        setEvents(result.data.events);
      } else {
        setError('Failed to load events');
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setIsLoading(false);
    }
  }, [filters, preferences]);

  // Fetch events on mount and when filters change
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Handle filter changes
  const handleTaxonomyChange = (taxonomy: string) => {
    setFilters(prev => ({ ...prev, taxonomy }));
  };

  const handleDateFilterChange = (dateFilter: DateFilter) => {
    setFilters(prev => ({ ...prev, dateFilter }));
  };

  const handleQueryChange = (query: string) => {
    setFilters(prev => ({ ...prev, query }));
  };

  const handleSearch = () => {
    fetchEvents();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-surface">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 px-6 py-4 border-b border-white/5 bg-dark-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<BackIcon className="w-5 h-5" />}
                onClick={() => navigate('/home')}
              >
                Back
              </Button>
              <h1 className="font-display text-2xl font-bold text-white">
                Discover Events
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-primary/20 text-primary' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                aria-label="Grid view"
              >
                <ViewGridIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-primary/20 text-primary' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                aria-label="List view"
              >
                <ViewListIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <SearchBar
            value={filters.query}
            onChange={handleQueryChange}
            onSearch={handleSearch}
            className="mb-4"
          />

          {/* Filter Bar */}
          <FilterBar
            selectedTaxonomy={filters.taxonomy}
            onTaxonomyChange={handleTaxonomyChange}
            selectedDateFilter={filters.dateFilter}
            onDateFilterChange={handleDateFilterChange}
          />
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Results count */}
          {!isLoading && !error && (
            <p className="text-gray-400 mb-6">
              {events.length === 0 
                ? 'No events found' 
                : `Showing ${events.length} events`}
              {preferences?.location?.city && (
                <span className="text-gray-500">
                  {' '}near {preferences.location.city}
                </span>
              )}
            </p>
          )}

          {/* Events */}
          <EventList
            events={events}
            isLoading={isLoading}
            error={error}
            variant={viewMode}
            emptyMessage={
              filters.query 
                ? `No events found for "${filters.query}". Try a different search.`
                : "No events found for your current filters. Try adjusting the date or category."
            }
          />
        </div>
      </main>
    </div>
  );
}

export default Discover;

