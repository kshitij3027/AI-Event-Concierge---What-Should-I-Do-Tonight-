import { useNavigate } from 'react-router-dom';
import { Card } from '../ui';
import { formatShortDate, getRelativeTime } from '../../lib/dateUtils';
import { getTaxonomyIcon } from '../../lib/taxonomyMap';
import type { Event } from '../../types/events';

interface RecommendationCardProps {
  event: Event;
  reason?: string;
  size?: 'sm' | 'md' | 'lg';
}

function LocationIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export function RecommendationCard({ event, reason, size = 'md' }: RecommendationCardProps) {
  const navigate = useNavigate();

  const primaryPerformer = event.performers?.find((p) => p.primary) || event.performers?.[0];
  const image = primaryPerformer?.images?.large || primaryPerformer?.images?.huge || primaryPerformer?.image;
  const eventTypeIcon = event.taxonomies?.[0]?.name
    ? getTaxonomyIcon(event.taxonomies[0].name)
    : '🎫';

  const lowestPrice = event.stats?.lowest_price;

  const handleClick = () => {
    navigate(`/event/${event.id}`);
  };

  if (size === 'sm') {
    return (
      <Card
        variant="elevated"
        padding="none"
        hoverable
        className="group cursor-pointer overflow-hidden flex-shrink-0 w-[200px]"
        onClick={handleClick}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
              <span className="text-4xl">{eventTypeIcon}</span>
            </div>
          )}
          {lowestPrice && (
            <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-dark-950/80 backdrop-blur-sm rounded text-xs font-semibold text-accent">
              ${lowestPrice}+
            </div>
          )}
        </div>
        <div className="p-3">
          <h4 className="font-semibold text-white text-sm truncate group-hover:text-primary transition-colors">
            {event.short_title || event.title}
          </h4>
          <p className="text-xs text-gray-400 truncate">
            {formatShortDate(event.datetime_local)}
          </p>
        </div>
      </Card>
    );
  }

  if (size === 'lg') {
    return (
      <Card
        variant="elevated"
        padding="none"
        hoverable
        className="group cursor-pointer overflow-hidden"
        onClick={handleClick}
      >
        <div className="relative aspect-[16/9] overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
              <span className="text-8xl">{eventTypeIcon}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950/90 via-transparent to-transparent" />
          
          {/* Badge */}
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 bg-primary/90 text-white text-xs font-semibold rounded-full">
              {eventTypeIcon} {event.type}
            </span>
          </div>

          {/* Price */}
          {lowestPrice && (
            <div className="absolute top-3 right-3 px-3 py-1 bg-dark-950/80 backdrop-blur-sm rounded-full">
              <span className="text-sm font-bold text-accent">${lowestPrice}+</span>
            </div>
          )}

          {/* Bottom content */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-display text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
              {event.title}
            </h3>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-accent font-medium">
                {getRelativeTime(event.datetime_local)}
              </span>
              <span className="text-gray-300 flex items-center gap-1">
                <LocationIcon className="w-4 h-4" />
                {event.venue.city}, {event.venue.state}
              </span>
            </div>
            {reason && (
              <p className="mt-2 text-xs text-primary-300 bg-primary/10 px-2 py-1 rounded-full inline-block">
                ✨ {reason}
              </p>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Default medium size
  return (
    <Card
      variant="elevated"
      padding="none"
      hoverable
      className="group cursor-pointer overflow-hidden"
      onClick={handleClick}
    >
      <div className="relative aspect-[3/2] overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
            <span className="text-6xl">{eventTypeIcon}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent" />
        
        {/* Price badge */}
        {lowestPrice && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-dark-950/80 backdrop-blur-sm rounded-full">
            <span className="text-sm font-bold text-accent">${lowestPrice}+</span>
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-0.5 bg-white/10 backdrop-blur-sm text-white text-xs rounded-full">
            {eventTypeIcon} {event.type}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h4 className="font-semibold text-white text-base mb-1 truncate group-hover:text-primary transition-colors">
          {event.short_title || event.title}
        </h4>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <span className="text-accent font-medium">
            {getRelativeTime(event.datetime_local)}
          </span>
          <span>•</span>
          <span className="truncate">{event.venue.name}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <LocationIcon className="w-3 h-3" />
          <span>{event.venue.city}, {event.venue.state}</span>
        </div>
        {reason && (
          <p className="mt-2 text-xs text-primary-300 bg-primary/10 px-2 py-1 rounded-full inline-block">
            ✨ {reason}
          </p>
        )}
      </div>
    </Card>
  );
}

export default RecommendationCard;

