import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../../../components/ui';
import { useUser } from '../../../contexts/UserContext';
import { getInterestOption, getGroupSizeOption } from '../../../lib/constants';

function ArrowLeftIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
    </svg>
  );
}

function CheckCircleIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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

function PencilIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );
}

export function ConfirmationStep() {
  const navigate = useNavigate();
  const { onboarding, completeOnboarding, setOnboardingStep, isLoading } = useUser();
  const [isSaving, setIsSaving] = useState(false);

  const handleBack = () => {
    setOnboardingStep(4);
    navigate('/onboarding/step/4');
  };

  const handleEdit = (step: number) => {
    setOnboardingStep(step);
    navigate(`/onboarding/step/${step}`);
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      await completeOnboarding();
      navigate('/home');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const groupSizeOption = onboarding.groupSize ? getGroupSizeOption(onboarding.groupSize) : null;

  const formatBudget = (value: number) => {
    if (value >= 500) return '$500+';
    return `$${value}`;
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
          You're all set! 🎊
        </h1>
        <p className="text-xl text-gray-300 max-w-md mx-auto">
          Here's a summary of your preferences. Edit anything you'd like to change.
        </p>
      </div>

      {/* Summary cards */}
      <div className="space-y-4 max-w-md mx-auto">
        {/* Location */}
        <Card variant="glass" padding="md">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📍</span>
              <div>
                <p className="text-sm text-gray-400">Location</p>
                <p className="font-semibold text-white">
                  {onboarding.location?.city || 'Not set'}
                  {onboarding.location?.state && `, ${onboarding.location.state}`}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<PencilIcon className="w-4 h-4" />}
              onClick={() => handleEdit(1)}
            >
              Edit
            </Button>
          </div>
        </Card>

        {/* Interests */}
        <Card variant="glass" padding="md">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">❤️</span>
              <div>
                <p className="text-sm text-gray-400">Interests</p>
                <p className="font-semibold text-white">
                  {onboarding.interests.length} selected
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<PencilIcon className="w-4 h-4" />}
              onClick={() => handleEdit(2)}
            >
              Edit
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 ml-11">
            {onboarding.interests.map((interestId) => {
              const interest = getInterestOption(interestId);
              return interest ? (
                <span
                  key={interest.id}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-surface-light rounded-full text-sm text-gray-300"
                >
                  <span>{interest.icon}</span>
                  {interest.label}
                </span>
              ) : null;
            })}
          </div>
        </Card>

        {/* Budget */}
        <Card variant="glass" padding="md">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💰</span>
              <div>
                <p className="text-sm text-gray-400">Budget Range</p>
                <p className="font-semibold text-white">
                  {formatBudget(onboarding.budgetRange.min)} - {formatBudget(onboarding.budgetRange.max)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<PencilIcon className="w-4 h-4" />}
              onClick={() => handleEdit(3)}
            >
              Edit
            </Button>
          </div>
        </Card>

        {/* Group Size */}
        <Card variant="glass" padding="md">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{groupSizeOption?.icon || '👤'}</span>
              <div>
                <p className="text-sm text-gray-400">Going with</p>
                <p className="font-semibold text-white">
                  {groupSizeOption?.label || 'Not set'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<PencilIcon className="w-4 h-4" />}
              onClick={() => handleEdit(4)}
            >
              Edit
            </Button>
          </div>
        </Card>
      </div>

      {/* Complete button */}
      <div className="max-w-md mx-auto space-y-4">
        <Button
          variant="accent"
          size="lg"
          fullWidth
          isLoading={isSaving || isLoading}
          leftIcon={<SparklesIcon className="w-5 h-5" />}
          onClick={handleComplete}
        >
          Start Discovering Events
        </Button>

        <Button
          variant="ghost"
          leftIcon={<ArrowLeftIcon className="w-5 h-5" />}
          onClick={handleBack}
          className="mx-auto"
        >
          Back
        </Button>
      </div>

      {/* Success message preview */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-accent text-sm">
          <CheckCircleIcon className="w-4 h-4" />
          Your preferences will be saved securely
        </div>
      </div>
    </div>
  );
}

export default ConfirmationStep;

