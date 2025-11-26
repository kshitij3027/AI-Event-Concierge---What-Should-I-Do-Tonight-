import { useState, useEffect } from 'react';
import { getHiddenGems } from '../../services/api';
import { RecommendationCard } from './RecommendationCard';
import type { Event, RecommendationParams } from '../../types/events';

interface HiddenGemsSectionProps {
  location?: RecommendationParams;
  interests?: string[];
}

export function HiddenGemsSection({ location, interests }: HiddenGemsSectionProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHiddenGems() {
      try {
        setIsLoading(true);
        setError(null);
        const result = await getHiddenGems({
          ...location,
          interests,
          perPage: 4,
        });
        if (result.success) {
          setEvents(result.data.events);
        }
      } catch (err) {
        console.error('Error fetching hidden gems:', err);
        setError('Failed to load hidden gems');
      } finally {
        setIsLoading(false);
      }
    }

    fetchHiddenGems();
  }, [location?.city, location?.state, location?.lat, location?.lon, interests]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-xl font-semibold text-white flex items-center gap-2">
              💎 Hidden Gems
            </h3>
            <p className="text-sm text-gray-400">Quality events off the beaten path</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-[3/2] bg-surface-light rounded-xl animate-pulse"
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
      <div>
        <h3 className="font-display text-xl font-semibold text-white flex items-center gap-2">
          💎 Hidden Gems
        </h3>
        <p className="text-sm text-gray-400">Quality events off the beaten path</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((event) => (
          <RecommendationCard
            key={event.id}
            event={event}
            size="md"
            reason="Insider pick"
          />
        ))}
      </div>
    </div>
  );
}

export default HiddenGemsSection;

