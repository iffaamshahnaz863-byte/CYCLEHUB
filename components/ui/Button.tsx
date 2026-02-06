
import React from 'react';
import Spinner from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseClasses =
    'flex items-center justify-center px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-brand-yellow text-brand-dark hover:bg-yellow-400 focus:ring-yellow-500',
    secondary: 'bg-brand-dark-light text-white hover:bg-brand-gray focus:ring-gray-500 border border-brand-gray',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? <Spinner size="sm" /> : children}
    </button>
  );
};

export default Button;
