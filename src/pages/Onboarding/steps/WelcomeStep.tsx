import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input } from '../../../components/ui';
import { useUser } from '../../../contexts/UserContext';
import { useGeolocation } from '../../../hooks/useGeolocation';

// SVG icons as components
function LocationIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
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

function CrosshairIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <line x1="22" y1="12" x2="18" y2="12" />
      <line x1="6" y1="12" x2="2" y2="12" />
      <line x1="12" y1="6" x2="12" y2="2" />
      <line x1="12" y1="22" x2="12" y2="18" />
    </svg>
  );
}

function ArrowRightIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  );
}

export function WelcomeStep() {
  const navigate = useNavigate();
  const { onboarding, setLocation, setOnboardingStep } = useUser();
  const { location, isLoading, error, detectLocation, setManualLocation } = useGeolocation();
  
  const [manualCity, setManualCity] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const currentLocation = onboarding.location || location;

  const handleDetectLocation = async () => {
    const detectedLocation = await detectLocation();
    if (detectedLocation) {
      setLocation(detectedLocation);
    }
  };

  const handleManualSubmit = () => {
    if (manualCity.trim()) {
      const manualLocation = {
        lat: 0,
        lng: 0,
        city: manualCity.trim(),
      };
      setManualLocation(manualLocation);
      setLocation(manualLocation);
    }
  };

  const handleNext = () => {
    setOnboardingStep(2);
    navigate('/onboarding/step/2');
  };

  const handleSkip = () => {
    setOnboardingStep(2);
    navigate('/onboarding/step/2');
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Welcome header */}
      <div className="text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
          Welcome! 👋
        </h1>
        <p className="text-xl text-gray-300 max-w-md mx-auto">
          Let's find the perfect events near you. First, tell us where you're located.
        </p>
      </div>

      {/* Location card */}
      <Card variant="glass" padding="lg" className="max-w-md mx-auto">
        <div className="space-y-6">
          {/* Current location display */}
          {currentLocation && (
            <div className="flex items-center gap-3 p-4 bg-accent/10 border border-accent/20 rounded-xl animate-fade-in">
              <div className="p-2 bg-accent/20 rounded-lg">
                <LocationIcon className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Your location</p>
                <p className="text-lg font-semibold text-white">
                  {currentLocation.city}
                  {currentLocation.state && `, ${currentLocation.state}`}
                </p>
              </div>
            </div>
          )}

          {/* Detect location button */}
          {!currentLocation && (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              leftIcon={<CrosshairIcon className="w-5 h-5" />}
              onClick={handleDetectLocation}
            >
              Detect My Location
            </Button>
          )}

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-sm text-gray-500">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Manual city input */}
          {!showManualInput ? (
            <Button
              variant="ghost"
              fullWidth
              leftIcon={<SearchIcon className="w-5 h-5" />}
              onClick={() => setShowManualInput(true)}
            >
              Enter city manually
            </Button>
          ) : (
            <div className="space-y-3 animate-fade-in">
              <Input
                placeholder="Enter your city..."
                value={manualCity}
                onChange={(e) => setManualCity(e.target.value)}
                leftIcon={<SearchIcon className="w-5 h-5" />}
                onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
              />
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setShowManualInput(false);
                    setManualCity('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleManualSubmit}
                  disabled={!manualCity.trim()}
                >
                  Set Location
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between items-center max-w-md mx-auto">
        <Button variant="ghost" onClick={handleSkip}>
          Skip for now
        </Button>
        <Button
          variant="primary"
          rightIcon={<ArrowRightIcon className="w-5 h-5" />}
          onClick={handleNext}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

export default WelcomeStep;

