import { useNavigate } from 'react-router-dom';
import type { Event } from '../../types/events';
import { formatEventDate, isHappeningSoon, getRelativeTime } from '../../lib/dateUtils';
import { getTaxonomyIcon } from '../../lib/taxonomyMap';
import { Card } from '../ui';

interface EventCardProps {
  event: Event;
  variant?: 'default' | 'compact';
}

function LocationIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function TicketIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  );
}

export function EventCard({ event, variant = 'default' }: EventCardProps) {
  const navigate = useNavigate();
  const happeningSoon = isHappeningSoon(event.datetime_local);
  
  // Get the primary performer image or a fallback
  const primaryPerformer = event.performers?.find(p => p.primary) || event.performers?.[0];
  const imageUrl = primaryPerformer?.images?.large || 
    primaryPerformer?.images?.medium || 
    primaryPerformer?.image;

  // Get the event type icon
  const eventTypeIcon = event.taxonomies?.[0]?.name 
    ? getTaxonomyIcon(event.taxonomies[0].name)
    : '🎫';

  // Format price display
  const priceDisplay = event.stats?.lowest_price 
    ? `From $${event.stats.lowest_price}`
    : 'See prices';

  const handleClick = () => {
    navigate(`/event/${event.id}`);
  };

  if (variant === 'compact') {
    return (
      <Card
        variant="glass"
        padding="md"
        hoverable
        onClick={handleClick}
        className="cursor-pointer group"
      >
        <div className="flex gap-4">
          {/* Thumbnail */}
          <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-surface-light">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">
                {eventTypeIcon}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate group-hover:text-primary transition-colors">
              {event.short_title || event.title}
            </h3>
            <p className="text-sm text-gray-400 mt-0.5">
              {formatEventDate(event.datetime_local)}
            </p>
            <p className="text-xs text-gray-500 mt-1 truncate">
              {event.venue.name}
            </p>
          </div>

          {/* Price */}
          <div className="text-right flex-shrink-0">
            <span className="text-sm font-medium text-accent">
              {priceDisplay}
            </span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      variant="glass"
      padding="none"
      hoverable
      onClick={handleClick}
      className="cursor-pointer group overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] bg-surface-light overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-primary/20 to-accent/20">
            {eventTypeIcon}
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent" />
        
        {/* Happening soon badge */}
        {happeningSoon && (
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 bg-accent text-dark-950 text-xs font-bold rounded-full animate-pulse-soft">
              🔥 Happening Soon
            </span>
          </div>
        )}

        {/* Time badge */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 bg-dark-950/70 backdrop-blur-sm text-white text-xs font-medium rounded-full border border-white/10">
            {getRelativeTime(event.datetime_local)}
          </span>
        </div>

        {/* Category badge */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2.5 py-1 bg-dark-950/70 backdrop-blur-sm text-white text-xs font-medium rounded-full border border-white/10">
            {eventTypeIcon} {event.type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-display font-semibold text-lg text-white group-hover:text-primary transition-colors line-clamp-2">
          {event.title}
        </h3>

        {/* Date & Time */}
        <p className="text-sm text-accent font-medium mt-2">
          {formatEventDate(event.datetime_local)}
        </p>

        {/* Venue */}
        <div className="flex items-center gap-1.5 text-sm text-gray-400 mt-2">
          <LocationIcon className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">
            {event.venue.name} • {event.venue.city}, {event.venue.state}
          </span>
        </div>

        {/* Price & Tickets */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-sm">
            <TicketIcon className="w-4 h-4 text-gray-500" />
            <span className="text-gray-400">{event.stats?.listing_count || 0} tickets</span>
          </div>
          <span className="text-lg font-bold text-accent">
            {priceDisplay}
          </span>
        </div>
      </div>
    </Card>
  );
}

export default EventCard;

