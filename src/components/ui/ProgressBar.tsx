interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  showLabels?: boolean;
  labels?: string[];
  className?: string;
}

export function ProgressBar({
  currentStep,
  totalSteps,
  showLabels = false,
  labels = [],
  className = '',
}: ProgressBarProps) {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className={`w-full ${className}`}>
      {/* Step indicators */}
      <div className="relative flex justify-between items-center mb-2">
        {/* Background track */}
        <div className="absolute left-0 right-0 h-1 bg-dark-700 rounded-full" />
        
        {/* Progress fill */}
        <div
          className="absolute left-0 h-1 bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />

        {/* Step dots */}
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <div
              key={stepNumber}
              className="relative z-10 flex flex-col items-center"
            >
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  text-sm font-semibold transition-all duration-300
                  ${isCompleted ? 'bg-gradient-to-r from-primary to-accent text-white' : ''}
                  ${isCurrent ? 'bg-primary text-white ring-4 ring-primary/30 scale-110' : ''}
                  ${isUpcoming ? 'bg-dark-700 text-gray-500 border border-dark-600' : ''}
                `}
              >
                {isCompleted ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Labels */}
      {showLabels && labels.length > 0 && (
        <div className="flex justify-between mt-2">
          {labels.map((label, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber <= currentStep;

            return (
              <span
                key={label}
                className={`
                  text-xs font-medium transition-colors duration-300
                  ${isActive ? 'text-white' : 'text-gray-500'}
                `}
                style={{ width: `${100 / totalSteps}%`, textAlign: 'center' }}
              >
                {label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Simpler linear progress bar variant
interface LinearProgressProps {
  value: number;
  max?: number;
  showPercentage?: boolean;
  className?: string;
  barClassName?: string;
}

export function LinearProgress({
  value,
  max = 100,
  showPercentage = false,
  className = '',
  barClassName = '',
}: LinearProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`w-full ${className}`}>
      <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500 ease-out ${barClassName}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <div className="mt-1 text-right">
          <span className="text-xs text-gray-400">{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
}

export default ProgressBar;

