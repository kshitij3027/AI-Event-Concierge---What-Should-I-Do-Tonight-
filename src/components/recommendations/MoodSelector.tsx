import { useState } from 'react';
import { Card, Button } from '../ui';
import type { MoodParams, EnergyLevel, SocialLevel, BudgetLevel } from '../../types/events';

interface MoodSelectorProps {
  onMoodSelect: (mood: MoodParams) => void;
  isLoading?: boolean;
  compact?: boolean;
}

interface MoodOption<T extends string> {
  id: T;
  label: string;
  icon: string;
  description: string;
}

const energyOptions: MoodOption<EnergyLevel>[] = [
  { id: 'high', label: 'Energetic', icon: '⚡', description: 'Ready to dance and cheer!' },
  { id: 'low', label: 'Relaxed', icon: '🧘', description: 'Something chill and refined' },
  { id: 'any', label: 'Open to anything', icon: '✨', description: 'Surprise me!' },
];

const socialOptions: MoodOption<SocialLevel>[] = [
  { id: 'group', label: 'Group outing', icon: '👥', description: 'Fun with friends or family' },
  { id: 'intimate', label: 'Intimate', icon: '💑', description: 'Date night or solo adventure' },
  { id: 'any', label: 'Either works', icon: '🎭', description: 'Flexible on the vibe' },
];

const budgetOptions: MoodOption<BudgetLevel>[] = [
  { id: 'low', label: 'Budget-friendly', icon: '💵', description: 'Under $75' },
  { id: 'medium', label: 'Mid-range', icon: '💰', description: '$50-$200' },
  { id: 'high', label: 'Splurge', icon: '💎', description: '$150+' },
  { id: 'any', label: 'Any price', icon: '🎫', description: 'Price isn\'t a factor' },
];

export function MoodSelector({ onMoodSelect, isLoading, compact = false }: MoodSelectorProps) {
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState<MoodParams>({
    energy: 'any',
    social: 'any',
    budget: 'any',
  });

  const steps = [
    { key: 'energy', question: "What's your energy level?", options: energyOptions },
    { key: 'social', question: 'Who are you going with?', options: socialOptions },
    { key: 'budget', question: 'What\'s your budget?', options: budgetOptions },
  ] as const;

  const handleOptionSelect = (value: EnergyLevel | SocialLevel | BudgetLevel) => {
    const currentStep = steps[step];
    const newMood = { ...mood, [currentStep.key]: value };
    setMood(newMood);

    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onMoodSelect(newMood);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    onMoodSelect(mood);
  };

  const currentStep = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold text-white">
            Quick mood match
          </h3>
          <span className="text-sm text-gray-400">
            {step + 1} of {steps.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-surface-light rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-gray-300 text-center">{currentStep.question}</p>

        <div className="grid grid-cols-2 gap-2">
          {currentStep.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              disabled={isLoading}
              className="p-3 bg-surface-light hover:bg-surface-lighter border border-white/5 hover:border-primary/30 rounded-xl transition-all text-left group disabled:opacity-50"
            >
              <span className="text-xl mb-1 block">{option.icon}</span>
              <span className="font-medium text-white text-sm group-hover:text-primary transition-colors">
                {option.label}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          {step > 0 ? (
            <Button variant="ghost" size="sm" onClick={handleBack}>
              ← Back
            </Button>
          ) : (
            <div />
          )}
          <Button variant="ghost" size="sm" onClick={handleSkip}>
            Skip →
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl font-bold text-white mb-2">
          I'm feeling...
        </h2>
        <p className="text-gray-400">
          Let us match you with the perfect event
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">
            Question {step + 1} of {steps.length}
          </span>
          <span className="text-sm text-primary font-medium">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2 bg-surface-light rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <Card variant="glass" padding="lg" className="mb-6">
        <h3 className="font-display text-2xl font-semibold text-white text-center mb-8">
          {currentStep.question}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentStep.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              disabled={isLoading}
              className="p-5 bg-surface hover:bg-surface-light border border-white/5 hover:border-primary/50 rounded-2xl transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform">
                {option.icon}
              </span>
              <span className="font-semibold text-white text-lg group-hover:text-primary transition-colors block mb-1">
                {option.label}
              </span>
              <span className="text-sm text-gray-400">
                {option.description}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {step > 0 ? (
          <Button variant="ghost" onClick={handleBack}>
            ← Back
          </Button>
        ) : (
          <div />
        )}
        <Button variant="ghost" onClick={handleSkip}>
          Skip to results →
        </Button>
      </div>

      {/* Current selections summary */}
      {step > 0 && (
        <div className="mt-8 p-4 bg-surface-light/50 rounded-xl">
          <p className="text-sm text-gray-400 mb-2">Your selections:</p>
          <div className="flex flex-wrap gap-2">
            {step >= 1 && mood.energy !== 'any' && (
              <span className="px-3 py-1 bg-primary/20 text-primary text-sm rounded-full">
                {energyOptions.find((o) => o.id === mood.energy)?.icon}{' '}
                {energyOptions.find((o) => o.id === mood.energy)?.label}
              </span>
            )}
            {step >= 2 && mood.social !== 'any' && (
              <span className="px-3 py-1 bg-accent/20 text-accent text-sm rounded-full">
                {socialOptions.find((o) => o.id === mood.social)?.icon}{' '}
                {socialOptions.find((o) => o.id === mood.social)?.label}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MoodSelector;

