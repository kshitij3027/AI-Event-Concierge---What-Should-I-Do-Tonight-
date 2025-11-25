import { Outlet, useLocation } from 'react-router-dom';
import { ProgressBar } from '../../components/ui';
import { ONBOARDING_STEPS } from '../../lib/constants';

export function OnboardingLayout() {
  const location = useLocation();
  
  // Extract current step from URL
  const currentStep = parseInt(location.pathname.split('/step/')[1] || '1', 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-surface flex flex-col">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Header with progress */}
      <header className="relative z-10 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          {/* Logo */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🎫</span>
              <span className="font-display text-xl font-bold text-white">
                What Should I Do Tonight?
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <ProgressBar
            currentStep={currentStep}
            totalSteps={ONBOARDING_STEPS.length}
            showLabels
            labels={ONBOARDING_STEPS.map((s) => s.label)}
          />
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-2xl animate-fade-in">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm text-gray-500">
            Your preferences help us find the perfect events for you
          </p>
        </div>
      </footer>
    </div>
  );
}

export default OnboardingLayout;

