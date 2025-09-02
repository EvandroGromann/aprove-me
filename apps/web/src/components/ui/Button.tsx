import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
type Size = 'xs' | 'sm' | 'md';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-500',
  secondary:
    'bg-gray-900 hover:bg-gray-800 text-white shadow-sm focus-visible:ring-2 focus-visible:ring-gray-500',
  outline:
    'bg-white border border-gray-300 text-gray-900 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-indigo-500',
  ghost:
  'bg-transparent text-indigo-600 hover:bg-indigo-50 focus-visible:ring-2 focus-visible:ring-indigo-500',
};

const sizeStyles: Record<Size, string> = {
  xs: 'px-2.5 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ className = '', variant = 'primary', size = 'md', ...props }, ref) => (
    <button
  ref={ref}
  className={`inline-flex items-center justify-center rounded-md font-medium tracking-[-0.01em] transition-colors transition-shadow disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-white hover:shadow-md active:shadow-sm active:translate-y-[0.5px] ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    />
  )
);

Button.displayName = 'Button';
