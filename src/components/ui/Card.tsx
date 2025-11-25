import { type ReactNode, type HTMLAttributes } from 'react';

type CardVariant = 'default' | 'glass' | 'elevated' | 'outline';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  selected?: boolean;
  children: ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-surface border border-white/5',
  glass: 'bg-white/5 backdrop-blur-md border border-white/10',
  elevated: 'bg-surface shadow-xl shadow-black/20 border border-white/5',
  outline: 'bg-transparent border-2 border-white/20',
};

const paddingStyles: Record<'none' | 'sm' | 'md' | 'lg', string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  variant = 'default',
  padding = 'md',
  hoverable = false,
  selected = false,
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`
        rounded-2xl transition-all duration-300
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${hoverable ? 'hover:scale-[1.02] hover:border-white/20 hover:shadow-lg hover:shadow-primary/10 cursor-pointer' : ''}
        ${selected ? 'border-primary ring-2 ring-primary/30 bg-primary/10' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardHeader({ className = '', children, ...props }: CardHeaderProps) {
  return (
    <div className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export function CardTitle({ className = '', children, ...props }: CardTitleProps) {
  return (
    <h3 className={`text-xl font-display font-semibold text-white ${className}`} {...props}>
      {children}
    </h3>
  );
}

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export function CardDescription({ className = '', children, ...props }: CardDescriptionProps) {
  return (
    <p className={`text-gray-400 mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardContent({ className = '', children, ...props }: CardContentProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardFooter({ className = '', children, ...props }: CardFooterProps) {
  return (
    <div className={`mt-4 pt-4 border-t border-white/10 ${className}`} {...props}>
      {children}
    </div>
  );
}

export default Card;

