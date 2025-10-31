import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

const base =
  'w-full px-3 py-2 rounded-md border bg-white text-gray-900 dark:bg-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-600';

export const Input: React.FC<InputProps> = ({ label, hint, error, className = '', ...rest }) => {
  return (
    <label className="block">
      {label && <span className="block text-sm mb-1 text-gray-700 dark:text-gray-300">{label}</span>}
      <input className={`${base} ${className}`} {...rest} />
      {hint && !error && <span className="block mt-1 text-xs text-gray-400">{hint}</span>}
      {error && <span className="block mt-1 text-xs text-red-500">{error}</span>}
    </label>
  );
};

export default Input;


