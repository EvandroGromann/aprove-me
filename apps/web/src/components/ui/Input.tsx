import { forwardRef, InputHTMLAttributes } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => (
    <input
      ref={ref}
  className={`w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 px-3 py-2 shadow-sm focus-visible:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/80 ${className}`}
      {...props}
    />
  )
);

Input.displayName = 'Input';
