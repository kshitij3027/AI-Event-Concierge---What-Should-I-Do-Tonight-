import { useNavigate } from 'react-router-dom';
import { Button, Card, RangeSlider } from '../../../components/ui';
import { useUser } from '../../../contexts/UserContext';
import { BUDGET_PRESETS } from '../../../lib/constants';

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

function DollarIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export function BudgetStep() {
  const navigate = useNavigate();
  const { onboarding, setBudgetRange, setOnboardingStep } = useUser();

  const handlePresetClick = (preset: typeof BUDGET_PRESETS[0]) => {
    setBudgetRange(preset.range);
  };

  const handleBack = () => {
    setOnboardingStep(2);
    navigate('/onboarding/step/2');
  };

  const handleNext = () => {
    setOnboardingStep(4);
    navigate('/onboarding/step/4');
  };

  const formatPrice = (value: number) => {
    if (value >= 500) return '$500+';
    return `$${value}`;
  };

  // Determine which preset is active (if any)
  const activePreset = BUDGET_PRESETS.find(
    (p) => p.range.min === onboarding.budgetRange.min && p.range.max === onboarding.budgetRange.max
  );

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
          What's your budget? 💰
        </h1>
        <p className="text-xl text-gray-300 max-w-md mx-auto">
          Set your comfortable price range per ticket.
        </p>
      </div>

      {/* Budget card */}
      <Card variant="glass" padding="lg" className="max-w-md mx-auto">
        <div className="space-y-8">
          {/* Current range display */}
          <div className="text-center p-6 bg-surface-light rounded-xl border border-white/5">
            <div className="flex items-center justify-center gap-2 text-gray-400 mb-2">
              <DollarIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Your range</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl font-bold text-white">
                {formatPrice(onboarding.budgetRange.min)}
              </span>
              <span className="text-gray-500">to</span>
              <span className="text-3xl font-bold text-accent">
                {formatPrice(onboarding.budgetRange.max)}
              </span>
            </div>
          </div>

          {/* Range slider */}
          <RangeSlider
            min={0}
            max={500}
            step={10}
            value={onboarding.budgetRange}
            onChange={setBudgetRange}
            formatValue={formatPrice}
            showValues={false}
          />

          {/* Quick presets */}
          <div className="space-y-3">
            <p className="text-sm text-gray-400 text-center">Quick presets</p>
            <div className="grid grid-cols-2 gap-2">
              {BUDGET_PRESETS.map((preset) => (
                <Button
                  key={preset.id}
                  variant={activePreset?.id === preset.id ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handlePresetClick(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Price tier info */}
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: 'Budget', color: 'text-green-400', range: '$0-50' },
              { label: 'Mid', color: 'text-yellow-400', range: '$50-150' },
              { label: 'Premium', color: 'text-orange-400', range: '$150-300' },
              { label: 'Luxury', color: 'text-primary', range: '$300+' },
            ].map((tier) => (
              <div key={tier.label} className="p-2">
                <span className={`block text-xs font-medium ${tier.color}`}>
                  {tier.label}
                </span>
                <span className="block text-xs text-gray-500 mt-1">
                  {tier.range}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center max-w-md mx-auto">
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
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

export default BudgetStep;

