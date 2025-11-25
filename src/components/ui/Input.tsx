import { type InputHTMLAttributes, type ReactNode, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onRightIconClick?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      onRightIconClick,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            className={`
              w-full bg-surface-light border rounded-xl px-4 py-3
              text-white placeholder-gray-500
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
              disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-dark-800
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${error ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : 'border-white/10 hover:border-white/20'}
              ${className}
            `}
            disabled={disabled}
            {...props}
          />

          {rightIcon && (
            <button
              type="button"
              onClick={onRightIconClick}
              className={`
                absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                hover:text-white transition-colors
                ${onRightIconClick ? 'cursor-pointer' : 'cursor-default'}
              `}
              disabled={!onRightIconClick}
              tabIndex={onRightIconClick ? 0 : -1}
            >
              {rightIcon}
            </button>
          )}
        </div>

        {(error || helperText) && (
          <p
            className={`mt-2 text-sm ${error ? 'text-red-400' : 'text-gray-500'}`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

