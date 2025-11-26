import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../../components/ui';
import { useUser } from '../../contexts/UserContext';
import { getInterestOption, getGroupSizeOption } from '../../lib/constants';
import { TrendingSection, MoodSelector } from '../../components/recommendations';
import type { MoodParams, RecommendationParams } from '../../types/events';

function SettingsIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function SearchIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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

function SparklesIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

export function Home() {
  const navigate = useNavigate();
  const { preferences, clearAllData } = useUser();

  const groupSizeOption = preferences?.groupSize 
    ? getGroupSizeOption(preferences.groupSize) 
    : null;

  const formatBudget = (value: number) => {
    if (value >= 500) return '$500+';
    return `$${value}`;
  };

  const handleResetPreferences = async () => {
    if (confirm('Are you sure you want to reset all preferences and start over?')) {
      await clearAllData();
      navigate('/onboarding');
    }
  };

  const handleMoodSelect = (mood: MoodParams) => {
    const params = new URLSearchParams();
    params.set('energy', mood.energy);
    params.set('social', mood.social);
    params.set('budget', mood.budget);
    navigate(`/recommendations?${params.toString()}`);
  };

  const locationParams: RecommendationParams = {
    lat: preferences?.location?.lat,
    lon: preferences?.location?.lng,
    city: preferences?.location?.city,
    state: preferences?.location?.state,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-surface">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-4 border-b border-white/5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎫</span>
            <span className="font-display text-lg font-bold text-white">
              What Should I Do Tonight?
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<SettingsIcon className="w-5 h-5" />}
            onClick={handleResetPreferences}
          >
            Reset
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Welcome section */}
          <div className="text-center animate-fade-in">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Welcome back! 👋
            </h1>
            <p className="text-xl text-gray-300">
              Ready to discover amazing events near{' '}
              <span className="text-accent font-semibold">
                {preferences?.location?.city || 'you'}
              </span>
              ?
            </p>
          </div>

          {/* Mood Selector Card */}
          <Card variant="glass" padding="lg" className="animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/20 rounded-xl">
                <SparklesIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-white">
                  I'm feeling...
                </h2>
                <p className="text-sm text-gray-400">Let us match you with the perfect event</p>
              </div>
            </div>
            <MoodSelector onMoodSelect={handleMoodSelect} compact />
          </Card>

          {/* Quick action cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
            <Card 
              variant="glass" 
              padding="lg" 
              hoverable 
              className="group cursor-pointer"
              onClick={() => navigate('/recommendations?mode=browse')}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/20 rounded-xl group-hover:bg-primary/30 transition-colors">
                  <SparklesIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white mb-1">
                    ✨ For You
                  </h3>
                  <p className="text-sm text-gray-400">
                    AI-powered recommendations based on your preferences
                  </p>
                </div>
              </div>
            </Card>

            <Card 
              variant="glass" 
              padding="lg" 
              hoverable 
              className="group cursor-pointer"
              onClick={() => navigate('/discover')}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-accent/20 rounded-xl group-hover:bg-accent/30 transition-colors">
                  <SearchIcon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white mb-1">
                    Browse events
                  </h3>
                  <p className="text-sm text-gray-400">
                    Explore all upcoming events in your area
                  </p>
                </div>
              </div>
            </Card>

            <Card 
              variant="glass" 
              padding="lg" 
              hoverable 
              className="group cursor-pointer"
              onClick={() => navigate('/discover?when=weekend')}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors">
                  <CalendarIcon className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white mb-1">
                    This weekend
                  </h3>
                  <p className="text-sm text-gray-400">
                    See what's happening this weekend
                  </p>
                </div>
              </div>
            </Card>

            <Card 
              variant="glass" 
              padding="lg" 
              hoverable 
              className="group cursor-pointer"
              onClick={() => navigate('/recommendations?mode=hidden-gems')}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-500/20 rounded-xl group-hover:bg-orange-500/30 transition-colors">
                  <span className="text-2xl">💎</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white mb-1">
                    Hidden Gems
                  </h3>
                  <p className="text-sm text-gray-400">
                    Quality events off the beaten path
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Trending Events Section */}
          <div className="animate-slide-up">
            <TrendingSection location={locationParams} title="Trending Now 🔥" />
          </div>

          {/* Your preferences summary */}
          <Card variant="elevated" padding="lg" className="animate-slide-up">
            <h2 className="font-display text-xl font-semibold text-white mb-4">
              Your Preferences
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Location */}
              <div className="text-center p-3 bg-surface-light rounded-xl">
                <span className="text-2xl block mb-1">📍</span>
                <p className="text-xs text-gray-400">Location</p>
                <p className="text-sm font-medium text-white truncate">
                  {preferences?.location?.city || 'Not set'}
                </p>
              </div>

              {/* Interests */}
              <div className="text-center p-3 bg-surface-light rounded-xl">
                <span className="text-2xl block mb-1">❤️</span>
                <p className="text-xs text-gray-400">Interests</p>
                <p className="text-sm font-medium text-white">
                  {preferences?.interests.length || 0} selected
                </p>
              </div>

              {/* Budget */}
              <div className="text-center p-3 bg-surface-light rounded-xl">
                <span className="text-2xl block mb-1">💰</span>
                <p className="text-xs text-gray-400">Budget</p>
                <p className="text-sm font-medium text-white">
                  {preferences 
                    ? `${formatBudget(preferences.budgetRange.min)}-${formatBudget(preferences.budgetRange.max)}`
                    : 'Not set'}
                </p>
              </div>

              {/* Group */}
              <div className="text-center p-3 bg-surface-light rounded-xl">
                <span className="text-2xl block mb-1">{groupSizeOption?.icon || '👤'}</span>
                <p className="text-xs text-gray-400">Going with</p>
                <p className="text-sm font-medium text-white">
                  {groupSizeOption?.label || 'Solo'}
                </p>
              </div>
            </div>

            {/* Interest tags */}
            {preferences && preferences.interests.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex flex-wrap gap-2">
                  {preferences.interests.map((interestId) => {
                    const interest = getInterestOption(interestId);
                    return interest ? (
                      <span
                        key={interest.id}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary"
                      >
                        <span>{interest.icon}</span>
                        {interest.label}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </Card>

          {/* Quick explore link */}
          <div className="text-center py-8 animate-slide-up">
            <Card 
              variant="glass" 
              padding="lg" 
              className="inline-block cursor-pointer group"
              hoverable
              onClick={() => navigate('/recommendations')}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl group-hover:scale-110 transition-transform">✨</span>
                <div className="text-left">
                  <p className="font-semibold text-white group-hover:text-primary transition-colors">
                    Find your perfect event!
                  </p>
                  <p className="text-sm text-gray-400">
                    Take our mood quiz for AI-powered recommendations.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;

