'use client';

import { useState } from 'react';

interface EmailInputProps {
  placeholder?: string;
  onSubmit: (value: string) => void;
}

export default function EmailInput({ placeholder, onSubmit }: EmailInputProps) {
  const [value, setValue] = useState('');
  const isValid = value.includes('@') && value.includes('.') && value.length > 3;

  const handleSubmit = () => {
    if (isValid) onSubmit(value.trim());
  };

  return (
    <div className="space-y-4">
      <input
        type="email"
        placeholder={placeholder || 'you@example.com'}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && isValid) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        className="w-full px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
      />

      <button
        onClick={handleSubmit}
        disabled={!isValid}
        className="w-full py-3 text-white font-semibold rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700"
      >
        Continue
      </button>
    </div>
  );
}