import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/design/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, leftIcon, rightSlot, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const hasError = !!error;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-small font-medium text-fg mb-1.5"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-10 px-3 rounded-md border bg-bg text-fg text-body',
              'placeholder:text-slate-500',
              'transition-all duration-hover ease-premium',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg',
              leftIcon && 'pl-10',
              rightSlot && 'pr-10',
              hasError
                ? 'border-red-500 focus:ring-red-500/40'
                : 'border-border focus:border-brand-500 focus:ring-brand-500/40',
              'disabled:bg-muted disabled:cursor-not-allowed disabled:opacity-60',
              className
            )}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...props}
          />

          {rightSlot && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {rightSlot}
            </div>
          )}
        </div>

        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-small text-slate-500">
            {hint}
          </p>
        )}

        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-small text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
