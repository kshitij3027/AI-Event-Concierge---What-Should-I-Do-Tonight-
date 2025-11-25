import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../../../components/ui';
import { useUser } from '../../../contexts/UserContext';
import { GROUP_SIZE_OPTIONS } from '../../../lib/constants';
import type { GroupSize } from '../../../types';

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

export function GroupSizeStep() {
  const navigate = useNavigate();
  const { onboarding, setGroupSize, setOnboardingStep } = useUser();

  const handleSelect = (size: GroupSize) => {
    setGroupSize(size);
  };

  const handleBack = () => {
    setOnboardingStep(3);
    navigate('/onboarding/step/3');
  };

  const handleNext = () => {
    setOnboardingStep(5);
    navigate('/onboarding/step/5');
  };

  const isValid = onboarding.groupSize !== null;

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
          Who's coming with you? 👥
        </h1>
        <p className="text-xl text-gray-300 max-w-md mx-auto">
          This helps us find events with the right seating options.
        </p>
      </div>

      {/* Group size options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
        {GROUP_SIZE_OPTIONS.map((option) => {
          const isSelected = onboarding.groupSize === option.id;

          return (
            <Card
              key={option.id}
              variant="glass"
              padding="lg"
              hoverable
              selected={isSelected}
              onClick={() => handleSelect(option.id)}
              className="relative cursor-pointer group"
            >
              {/* Selected checkmark */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <CheckIcon className="w-4 h-4 text-white" />
                </div>
              )}

              <div className="flex items-start gap-4">
                {/* Icon */}
                <span className="text-4xl group-hover:scale-110 transition-transform duration-200">
                  {option.icon}
                </span>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-white mb-1">
                    {option.label}
                  </h3>
                  <p className="text-sm text-gray-400 mb-2">
                    {option.description}
                  </p>
                  <span className="text-xs text-gray-500">
                    {option.minPeople === option.maxPeople
                      ? `${option.minPeople} person`
                      : `${option.minPeople}-${option.maxPeople} people`}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
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

export default GroupSizeStep;

