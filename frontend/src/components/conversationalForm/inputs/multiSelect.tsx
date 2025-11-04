// Example: src/components/conversational-form/inputs/MultiSelect.tsx
'use client';

import { useState } from 'react';

export default function MultiSelect({
  choices,
  onSubmit,
}: {
  choices: { id: string; label: string; value: string; icon?: string }[];
  onSubmit: (selected: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (v: string) => {
    setSelected((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  };

  return (
    <div className="space-y-3">
      {choices.map((c) => (
        <label
          key={c.id}
          className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
            selected.includes(c.value)
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300'
          }`}
        >
          <input
            type="checkbox"
            checked={selected.includes(c.value)}
            onChange={() => toggle(c.value)}
            className="w-5 h-5 text-blue-600"
          />
          {c.icon && <span className="text-xl">{c.icon}</span>}
          <span className="font-medium text-gray-900">{c.label}</span>
        </label>
      ))}
      <button
        onClick={() => onSubmit(selected)}
        disabled={selected.length === 0}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition font-semibold"
      >
        Continue {selected.length > 0 && `(${selected.length} selected)`}
      </button>
    </div>
  );
}