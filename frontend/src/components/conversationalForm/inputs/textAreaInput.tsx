'use client';

import { useState } from 'react';

interface TextareaInputProps {
  placeholder?: string;
  onSubmit: (value: string) => void;
  isLast: boolean;
}

export default function TextareaInput({
  placeholder,
  onSubmit,
  isLast,
}: TextareaInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    const finalValue = value.trim() || 'No specific concerns';
    onSubmit(finalValue);
  };

  return (
    <div className="space-y-4">
      <textarea
        placeholder={placeholder || 'Tell us more...'}
        rows={4}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none transition-colors"
      />

      <button
        onClick={handleSubmit}
        className="w-full py-3 text-white font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors"
      >
        {isLast ? 'Get My Personalized Analysis' : 'Continue'}
      </button>
    </div>
  );
}