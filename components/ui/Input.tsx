
import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, name, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">
            {label}
          </label>
        )}
        <input
          id={name}
          name={name}
          ref={ref}
          className={`w-full px-3 py-2 bg-brand-dark-light border border-brand-gray rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange ${className} ${error ? 'border-red-500' : ''}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
