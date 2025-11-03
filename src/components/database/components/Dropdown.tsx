// ./src/Components/DatabaseManager/components/Dropdown.tsx

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { DropdownProps } from '../types';

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  options,
  value,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <button
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full px-4 py-3 text-left bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            disabled
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">
              {value || 'Select an option...'}
            </span>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>

        {isOpen && !disabled && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
              {options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onChange(option, index);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 first:rounded-t-lg last:rounded-b-lg"
                >
                  {option}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};