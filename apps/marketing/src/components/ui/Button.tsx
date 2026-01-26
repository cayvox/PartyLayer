import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/design/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: cn(
    'bg-brand-500 text-fg shadow-button',
    'hover:bg-brand-600 hover:shadow-button-hover',
    'active:bg-brand-600 active:scale-[0.98]',
    'disabled:bg-brand-500/50 disabled:text-fg/50'
  ),
  secondary: cn(
    'bg-muted text-fg shadow-button',
    'hover:bg-muted-2 hover:shadow-button-hover',
    'active:bg-muted-2 active:scale-[0.98]',
    'disabled:bg-muted/50 disabled:text-fg/50'
  ),
  ghost: cn(
    'bg-transparent text-fg',
    'hover:bg-muted',
    'active:bg-muted-2 active:scale-[0.98]',
    'disabled:text-fg/50'
  ),
  outline: cn(
    'bg-transparent text-fg border border-border shadow-button',
    'hover:bg-muted hover:border-slate-300 hover:shadow-button-hover',
    'active:bg-muted-2 active:scale-[0.98]',
    'disabled:border-border/50 disabled:text-fg/50'
  ),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-small gap-1.5 rounded-sm',
  md: 'h-10 px-4 text-body gap-2 rounded-md',
  lg: 'h-12 px-6 text-body gap-2 rounded-md font-medium',
};

const Spinner = () => (
  <svg
    className="animate-spin h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium',
          'transition-all duration-hover ease-premium',
          'select-none whitespace-nowrap',
          variantStyles[variant],
          sizeStyles[size],
          isDisabled && 'cursor-not-allowed',
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {loading ? <Spinner /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
