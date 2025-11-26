import { useState, useEffect, useRef } from 'react';
import { getTrendingEvents } from '../../services/api';
import { RecommendationCard } from './RecommendationCard';
import type { Event, RecommendationParams } from '../../types/events';

interface TrendingSectionProps {
  location?: RecommendationParams;
  title?: string;
}

function ChevronLeftIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function TrendingSection({ location, title = 'Trending Now' }: TrendingSectionProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchTrending() {
      try {
        setIsLoading(true);
        setError(null);
        const result = await getTrendingEvents({
          ...location,
          perPage: 10,
        });
        if (result.success) {
          setEvents(result.data.events);
        }
      } catch (err) {
        console.error('Error fetching trending events:', err);
        setError('Failed to load trending events');
      } finally {
        setIsLoading(false);
      }
    }

    fetchTrending();
  }, [location?.city, location?.state, location?.lat, location?.lon]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 250;
      const newScrollLeft =
        direction === 'left'
          ? scrollContainerRef.current.scrollLeft - scrollAmount
          : scrollContainerRef.current.scrollLeft + scrollAmount;
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold text-white flex items-center gap-2">
            🔥 {title}
          </h3>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[200px] aspect-[4/3] bg-surface-light rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || events.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-semibold text-white flex items-center gap-2">
          🔥 {title}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 bg-surface-light hover:bg-surface-lighter rounded-full transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 bg-surface-light hover:bg-surface-lighter rounded-full transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-2 px-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {events.map((event) => (
          <div key={event.id} style={{ scrollSnapAlign: 'start' }}>
            <RecommendationCard event={event} size="sm" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default TrendingSection;

