import { useState, useCallback, useRef, useEffect } from 'react';

interface RangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: { min: number; max: number };
  onChange: (value: { min: number; max: number }) => void;
  formatValue?: (value: number) => string;
  label?: string;
  showValues?: boolean;
  className?: string;
}

export function RangeSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
  formatValue = (v) => `$${v}`,
  label,
  showValues = true,
  className = '',
}: RangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);

  const getPercentage = (val: number) => ((val - min) / (max - min)) * 100;

  const getValueFromPosition = useCallback(
    (clientX: number): number => {
      if (!trackRef.current) return min;

      const rect = trackRef.current.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const rawValue = min + percentage * (max - min);
      return Math.round(rawValue / step) * step;
    },
    [min, max, step]
  );

  const handleMouseDown = (handle: 'min' | 'max') => {
    setIsDragging(handle);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const newValue = getValueFromPosition(e.clientX);

      if (isDragging === 'min') {
        onChange({
          min: Math.min(newValue, value.max - step),
          max: value.max,
        });
      } else {
        onChange({
          min: value.min,
          max: Math.max(newValue, value.min + step),
        });
      }
    },
    [isDragging, getValueFromPosition, onChange, value, step]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || !e.touches[0]) return;

      const newValue = getValueFromPosition(e.touches[0].clientX);

      if (isDragging === 'min') {
        onChange({
          min: Math.min(newValue, value.max - step),
          max: value.max,
        });
      } else {
        onChange({
          min: value.min,
          max: Math.max(newValue, value.min + step),
        });
      }
    },
    [isDragging, getValueFromPosition, onChange, value, step]
  );

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const minPercent = getPercentage(value.min);
  const maxPercent = getPercentage(value.max);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-3">
          {label}
        </label>
      )}

      {/* Track container */}
      <div className="relative pt-6 pb-2">
        {/* Background track */}
        <div
          ref={trackRef}
          className="h-2 bg-dark-700 rounded-full cursor-pointer"
        >
          {/* Active range */}
          <div
            className="absolute h-2 bg-gradient-to-r from-primary to-accent rounded-full"
            style={{
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`,
            }}
          />
        </div>

        {/* Min handle */}
        <div
          className={`
            absolute top-4 w-6 h-6 -mt-2 -ml-3
            bg-white rounded-full shadow-lg
            border-2 border-primary cursor-grab
            transition-transform duration-150
            hover:scale-110 focus:scale-110 focus:outline-none
            ${isDragging === 'min' ? 'scale-125 cursor-grabbing' : ''}
          `}
          style={{ left: `${minPercent}%` }}
          onMouseDown={() => handleMouseDown('min')}
          onTouchStart={() => handleMouseDown('min')}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={value.max}
          aria-valuenow={value.min}
          tabIndex={0}
        >
          {/* Value tooltip */}
          <div
            className={`
              absolute -top-8 left-1/2 -translate-x-1/2
              px-2 py-1 bg-dark-800 rounded text-xs font-medium text-white
              whitespace-nowrap transition-opacity duration-200
              ${isDragging === 'min' ? 'opacity-100' : 'opacity-0'}
            `}
          >
            {formatValue(value.min)}
          </div>
        </div>

        {/* Max handle */}
        <div
          className={`
            absolute top-4 w-6 h-6 -mt-2 -ml-3
            bg-white rounded-full shadow-lg
            border-2 border-accent cursor-grab
            transition-transform duration-150
            hover:scale-110 focus:scale-110 focus:outline-none
            ${isDragging === 'max' ? 'scale-125 cursor-grabbing' : ''}
          `}
          style={{ left: `${maxPercent}%` }}
          onMouseDown={() => handleMouseDown('max')}
          onTouchStart={() => handleMouseDown('max')}
          role="slider"
          aria-valuemin={value.min}
          aria-valuemax={max}
          aria-valuenow={value.max}
          tabIndex={0}
        >
          {/* Value tooltip */}
          <div
            className={`
              absolute -top-8 left-1/2 -translate-x-1/2
              px-2 py-1 bg-dark-800 rounded text-xs font-medium text-white
              whitespace-nowrap transition-opacity duration-200
              ${isDragging === 'max' ? 'opacity-100' : 'opacity-0'}
            `}
          >
            {formatValue(value.max)}
          </div>
        </div>
      </div>

      {/* Value display */}
      {showValues && (
        <div className="flex justify-between mt-2">
          <span className="text-sm text-gray-400">{formatValue(value.min)}</span>
          <span className="text-sm text-gray-400">{formatValue(value.max)}</span>
        </div>
      )}

      {/* Scale markers */}
      <div className="flex justify-between mt-1 px-1">
        <span className="text-xs text-gray-600">{formatValue(min)}</span>
        <span className="text-xs text-gray-600">{formatValue(max)}</span>
      </div>
    </div>
  );
}

export default RangeSlider;

