import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../../../components/ui';
import { useUser } from '../../../contexts/UserContext';
import { INTEREST_OPTIONS } from '../../../lib/constants';
import type { InterestCategory } from '../../../types';

function ArrowLeftIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
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

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function InterestsStep() {
  const navigate = useNavigate();
  const { onboarding, toggleInterest, setOnboardingStep } = useUser();

  const handleToggle = (interest: InterestCategory) => {
    toggleInterest(interest);
  };

  const handleBack = () => {
    setOnboardingStep(1);
    navigate('/onboarding/step/1');
  };

  const handleNext = () => {
    setOnboardingStep(3);
    navigate('/onboarding/step/3');
  };

  const selectedCount = onboarding.interests.length;
  const isValid = selectedCount >= 1;

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
          What do you love? 🎉
        </h1>
        <p className="text-xl text-gray-300 max-w-md mx-auto">
          Pick the event types that excite you most. Select at least one.
        </p>
      </div>

      {/* Interest grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-xl mx-auto">
        {INTEREST_OPTIONS.map((interest) => {
          const isSelected = onboarding.interests.includes(interest.id);

          return (
            <Card
              key={interest.id}
              variant="glass"
              padding="md"
              hoverable
              selected={isSelected}
              onClick={() => handleToggle(interest.id)}
              className="relative cursor-pointer group"
            >
              {/* Selected checkmark */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-scale-in">
                  <CheckIcon className="w-4 h-4 text-white" />
                </div>
              )}

              <div className="text-center">
                <span className="text-4xl mb-2 block group-hover:scale-110 transition-transform duration-200">
                  {interest.icon}
                </span>
                <h3 className="font-semibold text-white mb-1">{interest.label}</h3>
                <p className="text-xs text-gray-400">{interest.description}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Selected count */}
      <div className="text-center">
        <span className="text-sm text-gray-400">
          {selectedCount === 0 ? (
            'Select at least one interest'
          ) : (
            <>
              <span className="text-primary font-semibold">{selectedCount}</span>
              {' '}interest{selectedCount !== 1 ? 's' : ''} selected
            </>
          )}
        </span>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center max-w-xl mx-auto">
        <Button
          variant="ghost"
          leftIcon={<ArrowLeftIcon className="w-5 h-5" />}
          onClick={handleBack}
        >
          Back
        </Button>
        <Button
          variant="primary"
          rightIcon={<ArrowRightIcon className="w-5 h-5" />}
          onClick={handleNext}
          disabled={!isValid}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

export default InterestsStep;

