import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-r from-primary to-primary-600 
    hover:from-primary-600 hover:to-primary-700 
    text-white font-semibold
    shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30
    transform hover:-translate-y-0.5 active:translate-y-0
    disabled:from-gray-500 disabled:to-gray-600 disabled:shadow-none disabled:transform-none
  `,
  secondary: `
    bg-surface-light hover:bg-surface-lighter 
    text-white font-medium 
    border border-white/10 hover:border-white/20
    disabled:bg-gray-700 disabled:text-gray-400
  `,
  accent: `
    bg-gradient-to-r from-accent to-accent-600 
    hover:from-accent-600 hover:to-accent-700
    text-dark font-semibold
    shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30
    transform hover:-translate-y-0.5 active:translate-y-0
    disabled:from-gray-500 disabled:to-gray-600 disabled:text-gray-300 disabled:shadow-none disabled:transform-none
  `,
  ghost: `
    bg-transparent hover:bg-white/10 
    text-white font-medium
    disabled:text-gray-500 disabled:hover:bg-transparent
  `,
  outline: `
    bg-transparent 
    border-2 border-primary hover:border-primary-600
    text-primary hover:text-primary-600 font-semibold
    hover:bg-primary/10
    disabled:border-gray-500 disabled:text-gray-500 disabled:hover:bg-transparent
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-6 py-3 text-base rounded-xl',
  lg: 'px-8 py-4 text-lg rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        transition-all duration-300 ease-out
        focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-dark-950
        disabled:cursor-not-allowed disabled:opacity-60
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}

export default Button;

