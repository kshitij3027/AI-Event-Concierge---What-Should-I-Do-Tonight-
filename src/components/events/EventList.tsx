import type { Event } from '../../types/events';
import { EventCard } from './EventCard';

interface EventListProps {
  events: Event[];
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  variant?: 'grid' | 'list';
  className?: string;
}

function LoadingCard() {
  return (
    <div className="bg-surface/50 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-[16/10] bg-surface-light" />
      <div className="p-4 space-y-3">
        <div className="h-6 bg-surface-light rounded w-3/4" />
        <div className="h-4 bg-surface-light rounded w-1/2" />
        <div className="h-4 bg-surface-light rounded w-2/3" />
        <div className="flex justify-between pt-3 border-t border-white/5">
          <div className="h-4 bg-surface-light rounded w-1/4" />
          <div className="h-6 bg-surface-light rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-6xl mb-4">🎭</span>
      <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
      <p className="text-gray-400 max-w-md">{message}</p>
    </div>
  );
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-6xl mb-4">😕</span>
      <h3 className="text-xl font-semibold text-white mb-2">Something went wrong</h3>
      <p className="text-red-400 max-w-md">{error}</p>
    </div>
  );
}

export function EventList({
  events,
  isLoading = false,
  error = null,
  emptyMessage = "Try adjusting your filters or search for something else.",
  variant = 'grid',
  className = '',
}: EventListProps) {
  if (error) {
    return <ErrorState error={error} />;
  }

  if (isLoading) {
    return (
      <div className={`
        ${variant === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
        }
        ${className}
      `}>
        {Array.from({ length: 6 }).map((_, i) => (
          <LoadingCard key={i} />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className={`
      ${variant === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
        : 'space-y-4'
      }
      ${className}
    `}>
      {events.map((event) => (
        <EventCard 
          key={event.id} 
          event={event} 
          variant={variant === 'list' ? 'compact' : 'default'}
        />
      ))}
    </div>
  );
}

export default EventList;

