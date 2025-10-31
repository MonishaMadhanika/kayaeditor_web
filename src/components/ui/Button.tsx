import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const base =
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';

const byVariant: Record<Variant, string> = {
  primary:
    'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
  secondary:
    'bg-white text-primary-700 border border-primary-200 hover:bg-primary-50 focus:ring-primary-400 dark:bg-neutral-800 dark:text-primary-200 dark:border-neutral-700 dark:hover:bg-neutral-700',
  ghost:
    'bg-transparent text-primary-700 hover:bg-primary-50 focus:ring-primary-400 dark:text-primary-300 dark:hover:bg-neutral-800',
  danger:
    'bg-danger text-white hover:bg-red-700 focus:ring-red-500',
};

const bySize: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  children,
  className = '',
  ...rest
}) => {
  return (
    <button className={`${base} ${byVariant[variant]} ${bySize[size]} ${className}`} {...rest}>
      {leftIcon ? <span className="mr-2 -ml-1">{leftIcon}</span> : null}
      {children}
      {rightIcon ? <span className="ml-2 -mr-1">{rightIcon}</span> : null}
    </button>
  );
};

export default Button;


