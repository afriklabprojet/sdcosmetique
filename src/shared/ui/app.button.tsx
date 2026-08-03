'use client';
import { ButtonHTMLAttributes, forwardRef } from 'react';

export type ButtonVariant = 'primary' | 'outline' | 'ghost';
export type ButtonSize    = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   ButtonVariant;
  size?:      ButtonSize;
  loading?:   boolean;
  fullWidth?: boolean;
}

const base =
  'inline-flex items-center justify-center font-bold rounded-sm ' +
  'transition-transform duration-100 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold)] ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-[#3D1400] text-white hover:bg-[var(--gold)] ' +
    'letter-spacing tracking-[0.12em] uppercase',
  outline:
    'border-2 border-[#3D1400] text-[#3D1400] bg-transparent hover:bg-[var(--gold-pale)] ' +
    'tracking-[0.12em] uppercase',
  ghost:
    'bg-transparent text-[var(--charcoal)] hover:bg-[var(--cream)]',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'text-xs  px-4 min-h-[36px] gap-1.5',
  md: 'text-[13px] px-5 min-h-[44px] gap-2',   /* WCAG 2.5.5 : 44px min */
  lg: 'text-sm  px-7 min-h-[52px] gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant  = 'primary',
      size     = 'md',
      loading  = false,
      fullWidth = false,
      className = '',
      children,
      disabled,
      ...rest
    },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={[
        base,
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {loading ? (
        <>
          {/* Spinner accessible */}
          <svg
            className="animate-spin h-4 w-4 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  ),
);
Button.displayName = 'Button';

export default Button;
