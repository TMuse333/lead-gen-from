import { Clock } from 'lucide-react';

interface TechnicalDetailsProps {
  promptLength: number;
  adviceUsed: number;
  generationTime?: number;
}

export function TechnicalDetails({ promptLength, adviceUsed, generationTime }: TechnicalDetailsProps) {
  return (
    <div className="space-y-3 text-sm">
      <div className="flex justify-between py-3 border-b border-gray-300">
        <span className="text-gray-600 font-medium">Prompt Length:</span>
        <span className="font-bold text-gray-900">{promptLength.toLocaleString()} characters</span>
      </div>
      <div className="flex justify-between py-3 border-b border-gray-300">
        <span className="text-gray-600 font-medium">Total Advice Used:</span>
        <span className="font-bold text-gray-900">{adviceUsed} items</span>
      </div>
      {generationTime && (
        <div className="flex justify-between py-3 border-b border-gray-300">
          <span className="text-gray-600 font-medium">Generation Time:</span>
          <span className="font-bold text-gray-900">{generationTime.toFixed(2)}s</span>
        </div>
      )}
      <div className="flex justify-between py-3 border-b border-gray-300">
        <span className="text-gray-600 font-medium">AI Model:</span>
        <span className="font-bold text-gray-900">GPT-4o-mini</span>
      </div>
      <div className="flex justify-between py-3">
        <span className="text-gray-600 font-medium">Vector Database:</span>
        <span className="font-bold text-gray-900">Qdrant Cloud</span>
      </div>
    </div>
  );
}