import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById } from '../../services/api';
import { formatEventDate, formatShortDate, getRelativeTime } from '../../lib/dateUtils';
import { getTaxonomyIcon } from '../../lib/taxonomyMap';
import { Button, Card } from '../../components/ui';
import type { Event } from '../../types/events';

function BackIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}

function CalendarIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
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

function ExternalLinkIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

function ShareIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-surface">
      <div className="relative">
        <div className="aspect-[21/9] max-h-[400px] bg-surface-light animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/50 to-transparent" />
      </div>
      <div className="max-w-4xl mx-auto px-6 -mt-32 relative z-10">
        <div className="space-y-4">
          <div className="h-8 bg-surface-light rounded w-1/4 animate-pulse" />
          <div className="h-12 bg-surface-light rounded w-3/4 animate-pulse" />
          <div className="h-6 bg-surface-light rounded w-1/2 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      if (!id) {
        setError('Invalid event ID');
        setIsLoading(false);
        return;
      }

      try {
        const eventId = parseInt(id, 10);
        if (isNaN(eventId)) {
          setError('Invalid event ID');
          setIsLoading(false);
          return;
        }

        const result = await getEventById(eventId);
        if (result.success) {
          setEvent(result.data);
        } else {
          setError('Event not found');
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError(err instanceof Error ? err.message : 'Failed to load event');
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvent();
  }, [id]);

  const handleShare = async () => {
    if (!event) return;
    
    const shareData = {
      title: event.title,
      text: `Check out ${event.title} at ${event.venue.name}!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleGetTickets = () => {
    if (event?.url) {
      window.open(event.url, '_blank', 'noopener,noreferrer');
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-surface flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block">😕</span>
          <h1 className="text-2xl font-bold text-white mb-2">Event Not Found</h1>
          <p className="text-gray-400 mb-6">{error || "We couldn't find this event."}</p>
          <Button onClick={() => navigate('/discover')} variant="primary">
            Browse Events
          </Button>
        </div>
      </div>
    );
  }

  // Get primary performer image
  const primaryPerformer = event.performers?.find(p => p.primary) || event.performers?.[0];
  const heroImage = primaryPerformer?.images?.huge || 
    primaryPerformer?.images?.large || 
    primaryPerformer?.image;

  const eventTypeIcon = event.taxonomies?.[0]?.name 
    ? getTaxonomyIcon(event.taxonomies[0].name)
    : '🎫';

  const lowestPrice = event.stats?.lowest_price;
  const highestPrice = event.stats?.highest_price;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-surface">
      {/* Hero Image */}
      <div className="relative">
        <div className="aspect-[21/9] max-h-[400px] overflow-hidden">
          {heroImage ? (
            <img 
              src={heroImage} 
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
              <span className="text-9xl">{eventTypeIcon}</span>
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/50 to-transparent" />

        {/* Back button */}
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<BackIcon className="w-5 h-5" />}
            onClick={() => navigate(-1)}
            className="bg-dark-950/50 backdrop-blur-sm hover:bg-dark-950/70"
          >
            Back
          </Button>
        </div>

        {/* Share button */}
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ShareIcon className="w-5 h-5" />}
            onClick={handleShare}
            className="bg-dark-950/50 backdrop-blur-sm hover:bg-dark-950/70"
          >
            Share
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 -mt-32 relative z-10 pb-32">
        {/* Main Info */}
        <div className="mb-8">
          {/* Category badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-primary/20 text-primary text-sm font-medium rounded-full">
              {eventTypeIcon} {event.type}
            </span>
            <span className="px-3 py-1 bg-accent/20 text-accent text-sm font-medium rounded-full">
              {getRelativeTime(event.datetime_local)}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            {event.title}
          </h1>

          {/* Date & Time */}
          <div className="flex items-center gap-2 text-lg text-accent font-medium mb-2">
            <CalendarIcon className="w-5 h-5" />
            <span>{formatEventDate(event.datetime_local)}</span>
          </div>

          {/* Venue */}
          <div className="flex items-center gap-2 text-gray-300">
            <LocationIcon className="w-5 h-5 text-gray-400" />
            <span>
              {event.venue.name} • {event.venue.city}, {event.venue.state}
            </span>
          </div>
          {event.venue.address && (
            <p className="text-gray-500 text-sm ml-7">{event.venue.address}</p>
          )}
        </div>

        {/* Pricing Card */}
        <Card variant="glass" padding="lg" className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-gray-400 text-sm mb-1">Ticket Prices</p>
              <div className="flex items-baseline gap-2">
                {lowestPrice ? (
                  <>
                    <span className="text-3xl font-bold text-accent">
                      ${lowestPrice}
                    </span>
                    {highestPrice && highestPrice !== lowestPrice && (
                      <span className="text-lg text-gray-400">
                        - ${highestPrice}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-xl text-gray-400">See prices on SeatGeek</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <TicketIcon className="w-4 h-4" />
                <span>{event.stats?.listing_count || 0} tickets available</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              rightIcon={<ExternalLinkIcon className="w-5 h-5" />}
              onClick={handleGetTickets}
              className="w-full md:w-auto"
            >
              Get Tickets on SeatGeek
            </Button>
          </div>
        </Card>

        {/* Performers */}
        {event.performers && event.performers.length > 0 && (
          <div className="mb-8">
            <h2 className="font-display text-xl font-semibold text-white mb-4">
              {event.performers.length > 1 ? 'Performers' : 'Performer'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {event.performers.map((performer) => (
                <Card 
                  key={performer.id} 
                  variant="elevated" 
                  padding="md" 
                  className="text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden bg-surface-light">
                    {performer.image || performer.images?.small ? (
                      <img 
                        src={performer.images?.small || performer.image}
                        alt={performer.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        🎤
                      </div>
                    )}
                  </div>
                  <p className="font-medium text-white text-sm truncate">
                    {performer.short_name || performer.name}
                  </p>
                  {performer.primary && (
                    <span className="text-xs text-primary">Headliner</span>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Venue Details */}
        <div className="mb-8">
          <h2 className="font-display text-xl font-semibold text-white mb-4">
            Venue
          </h2>
          <Card variant="elevated" padding="lg">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <LocationIcon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white text-lg">
                  {event.venue.name}
                </h3>
                <p className="text-gray-400">
                  {event.venue.address && `${event.venue.address}, `}
                  {event.venue.city}, {event.venue.state} {event.venue.postal_code}
                </p>
                {event.venue.url && (
                  <a 
                    href={event.venue.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline mt-2 text-sm"
                  >
                    View venue info
                    <ExternalLinkIcon className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Event Description */}
        {event.description && (
          <div className="mb-8">
            <h2 className="font-display text-xl font-semibold text-white mb-4">
              About
            </h2>
            <Card variant="elevated" padding="lg">
              <p className="text-gray-300 whitespace-pre-line">{event.description}</p>
            </Card>
          </div>
        )}

        {/* Quick Facts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card variant="glass" padding="md" className="text-center">
            <span className="text-2xl mb-1 block">{eventTypeIcon}</span>
            <p className="text-xs text-gray-400">Event Type</p>
            <p className="text-sm font-medium text-white capitalize">{event.type}</p>
          </Card>
          <Card variant="glass" padding="md" className="text-center">
            <span className="text-2xl mb-1 block">📅</span>
            <p className="text-xs text-gray-400">Date</p>
            <p className="text-sm font-medium text-white">{formatShortDate(event.datetime_local)}</p>
          </Card>
          <Card variant="glass" padding="md" className="text-center">
            <span className="text-2xl mb-1 block">🎟️</span>
            <p className="text-xs text-gray-400">Tickets</p>
            <p className="text-sm font-medium text-white">{event.stats?.listing_count || 0} available</p>
          </Card>
          <Card variant="glass" padding="md" className="text-center">
            <span className="text-2xl mb-1 block">⭐</span>
            <p className="text-xs text-gray-400">Popularity</p>
            <p className="text-sm font-medium text-white">{Math.round((event.score || 0) * 100)}%</p>
          </Card>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-20 p-4 bg-dark-950/90 backdrop-blur-xl border-t border-white/5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-400">Starting from</p>
            <p className="text-xl font-bold text-accent">
              {lowestPrice ? `$${lowestPrice}` : 'See prices'}
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            rightIcon={<ExternalLinkIcon className="w-5 h-5" />}
            onClick={handleGetTickets}
          >
            Get Tickets
          </Button>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;

