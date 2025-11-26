import { useState, useEffect, useRef } from 'react';
import { getSimilarEvents } from '../../services/api';
import { RecommendationCard } from './RecommendationCard';
import type { Event } from '../../types/events';

interface SimilarEventsProps {
  eventId: number;
  excludeEventId?: number;
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

export function SimilarEvents({ eventId, excludeEventId }: SimilarEventsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchSimilar() {
      try {
        setIsLoading(true);
        setError(null);
        const result = await getSimilarEvents(eventId, 8);
        if (result.success) {
          // Filter out the current event if somehow included
          const filteredEvents = result.data.events.filter(
            (e) => e.id !== excludeEventId && e.id !== eventId
          );
          setEvents(filteredEvents);
        }
      } catch (err) {
        console.error('Error fetching similar events:', err);
        setError('Failed to load similar events');
      } finally {
        setIsLoading(false);
      }
    }

    if (eventId) {
      fetchSimilar();
    }
  }, [eventId, excludeEventId]);

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
        <h3 className="font-display text-xl font-semibold text-white">
          If you like this, you might also enjoy...
        </h3>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
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
        <h3 className="font-display text-xl font-semibold text-white">
          If you like this, you might also enjoy...
        </h3>
        {events.length > 3 && (
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
        )}
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

export default SimilarEvents;

