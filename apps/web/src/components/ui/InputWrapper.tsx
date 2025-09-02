import React, { InputHTMLAttributes } from 'react'

interface InputWrapperProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input: React.FC<InputWrapperProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-1 w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {props.required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <input
        className={`w-full rounded-md border ${
          error ? 'border-red-300' : 'border-gray-300'
        } bg-white text-gray-900 placeholder:text-gray-400 px-3 py-2 shadow-sm focus-visible:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/80 ${className}`}
        {...props}
      />
      
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
