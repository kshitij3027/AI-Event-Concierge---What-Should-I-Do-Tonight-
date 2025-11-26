import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { getMoodBasedEvents, getRecommendations, getHiddenGems } from '../../services/api';
import { Button, Card } from '../../components/ui';
import {
  MoodSelector,
  RecommendationCard,
  TrendingSection,
  HiddenGemsSection,
} from '../../components/recommendations';
import type { Event, MoodParams, RecommendationParams } from '../../types/events';

function BackIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}

function RefreshIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

type ViewMode = 'selector' | 'results' | 'browse' | 'hidden-gems';

export function Recommendations() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { preferences } = useUser();

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const mode = searchParams.get('mode');
    if (mode === 'browse') return 'browse';
    if (mode === 'hidden-gems') return 'hidden-gems';
    if (searchParams.get('energy') || searchParams.get('social') || searchParams.get('budget')) {
      return 'results';
    }
    return 'selector';
  });

  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMood, setCurrentMood] = useState<MoodParams | null>(() => {
    const energy = searchParams.get('energy') as MoodParams['energy'] | null;
    const social = searchParams.get('social') as MoodParams['social'] | null;
    const budget = searchParams.get('budget') as MoodParams['budget'] | null;
    if (energy || social || budget) {
      return {
        energy: energy || 'any',
        social: social || 'any',
        budget: budget || 'any',
      };
    }
    return null;
  });

  const locationParams: RecommendationParams = {
    lat: preferences?.location?.lat,
    lon: preferences?.location?.lng,
    city: preferences?.location?.city,
    state: preferences?.location?.state,
    interests: preferences?.interests,
  };

  useEffect(() => {
    if (currentMood && viewMode === 'results') {
      fetchMoodBasedEvents(currentMood);
    }
  }, [currentMood, viewMode]);

  useEffect(() => {
    if (viewMode === 'browse') {
      fetchPersonalizedRecommendations();
    }
  }, [viewMode]);

  useEffect(() => {
    if (viewMode === 'hidden-gems') {
      fetchHiddenGemsEvents();
    }
  }, [viewMode]);

  const fetchMoodBasedEvents = async (mood: MoodParams) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getMoodBasedEvents(mood, {
        ...locationParams,
        perPage: 12,
      });
      if (result.success) {
        setEvents(result.data.events);
      }
    } catch (err) {
      console.error('Error fetching mood-based events:', err);
      setError('Failed to load events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPersonalizedRecommendations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getRecommendations({
        ...locationParams,
        perPage: 12,
      });
      if (result.success) {
        setEvents(result.data.events);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to load recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHiddenGemsEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getHiddenGems({
        ...locationParams,
        interests: preferences?.interests,
        perPage: 12,
      });
      if (result.success) {
        setEvents(result.data.events);
      }
    } catch (err) {
      console.error('Error fetching hidden gems:', err);
      setError('Failed to load hidden gems. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoodSelect = (mood: MoodParams) => {
    setCurrentMood(mood);
    setViewMode('results');
    // Update URL params
    const params = new URLSearchParams();
    params.set('energy', mood.energy);
    params.set('social', mood.social);
    params.set('budget', mood.budget);
    setSearchParams(params);
  };

  const handleResetMood = () => {
    setCurrentMood(null);
    setViewMode('selector');
    setSearchParams({});
    setEvents([]);
  };

  const handleBrowseAll = () => {
    setViewMode('browse');
    setSearchParams({ mode: 'browse' });
  };

  const getMoodSummary = (mood: MoodParams): string => {
    const parts: string[] = [];
    if (mood.energy === 'high') parts.push('energetic');
    if (mood.energy === 'low') parts.push('relaxed');
    if (mood.social === 'group') parts.push('group-friendly');
    if (mood.social === 'intimate') parts.push('intimate');
    if (mood.budget === 'low') parts.push('budget-friendly');
    if (mood.budget === 'high') parts.push('premium');
    return parts.length > 0 ? parts.join(', ') : 'diverse';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-surface">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-4 border-b border-white/5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<BackIcon className="w-5 h-5" />}
              onClick={() => navigate('/home')}
            >
              Home
            </Button>
            <div className="h-6 w-px bg-white/10" />
            <h1 className="font-display text-lg font-bold text-white">
              ✨ For You
            </h1>
          </div>
          {viewMode !== 'selector' && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshIcon className="w-4 h-4" />}
              onClick={handleResetMood}
            >
              New mood
            </Button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Mood Selector View */}
          {viewMode === 'selector' && (
            <div className="animate-fade-in">
              <MoodSelector onMoodSelect={handleMoodSelect} isLoading={isLoading} />

              {/* Or browse all */}
              <div className="text-center mt-12">
                <p className="text-gray-400 mb-4">Or skip the quiz and...</p>
                <Button variant="ghost" onClick={handleBrowseAll}>
                  Browse personalized recommendations →
                </Button>
              </div>

              {/* Trending preview */}
              <div className="mt-16">
                <TrendingSection location={locationParams} title="What's hot right now" />
              </div>
            </div>
          )}

          {/* Results View */}
          {viewMode === 'results' && (
            <div className="animate-fade-in space-y-8">
              {/* Results header */}
              <div className="text-center">
                <h2 className="font-display text-3xl font-bold text-white mb-2">
                  Here's what we found! 🎉
                </h2>
                {currentMood && (
                  <p className="text-gray-400">
                    {getMoodSummary(currentMood)} events{' '}
                    {preferences?.location?.city && (
                      <span>near <span className="text-accent">{preferences.location.city}</span></span>
                    )}
                  </p>
                )}
              </div>

              {/* Mood badges */}
              {currentMood && (
                <div className="flex flex-wrap justify-center gap-2">
                  {currentMood.energy !== 'any' && (
                    <span className="px-3 py-1 bg-primary/20 text-primary text-sm rounded-full">
                      {currentMood.energy === 'high' ? '⚡ Energetic' : '🧘 Relaxed'}
                    </span>
                  )}
                  {currentMood.social !== 'any' && (
                    <span className="px-3 py-1 bg-accent/20 text-accent text-sm rounded-full">
                      {currentMood.social === 'group' ? '👥 Group' : '💑 Intimate'}
                    </span>
                  )}
                  {currentMood.budget !== 'any' && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">
                      {currentMood.budget === 'low' && '💵 Budget-friendly'}
                      {currentMood.budget === 'medium' && '💰 Mid-range'}
                      {currentMood.budget === 'high' && '💎 Premium'}
                    </span>
                  )}
                </div>
              )}

              {/* Loading state */}
              {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="aspect-[3/2] bg-surface-light rounded-xl animate-pulse" />
                  ))}
                </div>
              )}

              {/* Error state */}
              {error && (
                <Card variant="glass" padding="lg" className="text-center">
                  <span className="text-4xl mb-4 block">😕</span>
                  <p className="text-white font-medium mb-2">{error}</p>
                  <Button variant="primary" onClick={() => currentMood && fetchMoodBasedEvents(currentMood)}>
                    Try again
                  </Button>
                </Card>
              )}

              {/* Results grid */}
              {!isLoading && !error && events.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event, index) => (
                    <RecommendationCard
                      key={event.id}
                      event={event}
                      size={index === 0 ? 'lg' : 'md'}
                      reason={index < 3 ? 'Perfect match for your mood' : undefined}
                    />
                  ))}
                </div>
              )}

              {/* Empty state */}
              {!isLoading && !error && events.length === 0 && (
                <Card variant="glass" padding="lg" className="text-center">
                  <span className="text-6xl mb-4 block">🔍</span>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No events found for this mood
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Try adjusting your preferences or browse all events
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button variant="outline" onClick={handleResetMood}>
                      Change mood
                    </Button>
                    <Button variant="primary" onClick={() => navigate('/discover')}>
                      Browse all events
                    </Button>
                  </div>
                </Card>
              )}

              {/* Hidden gems section */}
              {!isLoading && events.length > 0 && (
                <div className="mt-12">
                  <HiddenGemsSection
                    location={locationParams}
                    interests={preferences?.interests}
                  />
                </div>
              )}
            </div>
          )}

          {/* Browse View */}
          {viewMode === 'browse' && (
            <div className="animate-fade-in space-y-8">
              {/* Header */}
              <div>
                <h2 className="font-display text-3xl font-bold text-white mb-2">
                  Recommended for you
                </h2>
                <p className="text-gray-400">
                  Based on your interests and location
                </p>
              </div>

              {/* Loading state */}
              {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="aspect-[3/2] bg-surface-light rounded-xl animate-pulse" />
                  ))}
                </div>
              )}

              {/* Error state */}
              {error && (
                <Card variant="glass" padding="lg" className="text-center">
                  <span className="text-4xl mb-4 block">😕</span>
                  <p className="text-white font-medium mb-2">{error}</p>
                  <Button variant="primary" onClick={fetchPersonalizedRecommendations}>
                    Try again
                  </Button>
                </Card>
              )}

              {/* Results */}
              {!isLoading && !error && events.length > 0 && (
                <>
                  {/* Featured event */}
                  <div className="mb-8">
                    <RecommendationCard
                      event={events[0]}
                      size="lg"
                      reason="Top pick for you"
                    />
                  </div>

                  {/* Rest of events */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.slice(1).map((event) => (
                      <RecommendationCard key={event.id} event={event} size="md" />
                    ))}
                  </div>
                </>
              )}

              {/* Trending section */}
              <div className="mt-12">
                <TrendingSection location={locationParams} />
              </div>

              {/* Hidden gems */}
              <div className="mt-12">
                <HiddenGemsSection
                  location={locationParams}
                  interests={preferences?.interests}
                />
              </div>

              {/* CTA */}
              <Card variant="glass" padding="lg" className="text-center mt-12">
                <p className="text-gray-400 mb-4">
                  Want more personalized results?
                </p>
                <Button variant="primary" onClick={handleResetMood}>
                  ✨ Try mood matching
                </Button>
              </Card>
            </div>
          )}

          {/* Hidden Gems View */}
          {viewMode === 'hidden-gems' && (
            <div className="animate-fade-in space-y-8">
              {/* Header */}
              <div>
                <h2 className="font-display text-3xl font-bold text-white mb-2 flex items-center gap-3">
                  💎 Hidden Gems
                </h2>
                <p className="text-gray-400">
                  Quality events off the beaten path
                </p>
              </div>

              {/* Loading state */}
              {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="aspect-[3/2] bg-surface-light rounded-xl animate-pulse" />
                  ))}
                </div>
              )}

              {/* Error state */}
              {error && (
                <Card variant="glass" padding="lg" className="text-center">
                  <span className="text-4xl mb-4 block">😕</span>
                  <p className="text-white font-medium mb-2">{error}</p>
                  <Button variant="primary" onClick={fetchHiddenGemsEvents}>
                    Try again
                  </Button>
                </Card>
              )}

              {/* Results */}
              {!isLoading && !error && events.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <RecommendationCard
                      key={event.id}
                      event={event}
                      size="md"
                      reason="Insider pick"
                    />
                  ))}
                </div>
              )}

              {/* Empty state */}
              {!isLoading && !error && events.length === 0 && (
                <Card variant="glass" padding="lg" className="text-center">
                  <span className="text-6xl mb-4 block">💎</span>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No hidden gems found
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Try adjusting your preferences or check back later
                  </p>
                  <Button variant="primary" onClick={() => navigate('/discover')}>
                    Browse all events
                  </Button>
                </Card>
              )}

              {/* CTA */}
              <Card variant="glass" padding="lg" className="text-center mt-8">
                <p className="text-gray-400 mb-4">
                  Want to explore by mood?
                </p>
                <Button variant="primary" onClick={handleResetMood}>
                  ✨ Try mood matching
                </Button>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Recommendations;

