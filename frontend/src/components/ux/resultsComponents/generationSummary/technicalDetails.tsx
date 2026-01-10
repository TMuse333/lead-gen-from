interface TechnicalDetailsProps {
  promptLength?: number;
  adviceUsed?: number;
  generationTime?: number;
  generatedBy?: string;
}

export function TechnicalDetails({ promptLength, adviceUsed, generationTime, generatedBy }: TechnicalDetailsProps) {
  const isClientSide = generatedBy === 'client-side-static';

  return (
    <div className="space-y-3 text-sm">
      {/* Show prompt length only for server-side generation */}
      {promptLength != null && promptLength > 0 && (
        <div className="flex justify-between py-3 border-b border-gray-300">
          <span className="text-gray-600 font-medium">Prompt Length:</span>
          <span className="font-bold text-gray-900">{promptLength.toLocaleString()} characters</span>
        </div>
      )}
      <div className="flex justify-between py-3 border-b border-gray-300">
        <span className="text-gray-600 font-medium">{isClientSide ? 'Stories Used:' : 'Total Advice Used:'}</span>
        <span className="font-bold text-gray-900">{adviceUsed ?? 0} items</span>
      </div>
      {generationTime && (
        <div className="flex justify-between py-3 border-b border-gray-300">
          <span className="text-gray-600 font-medium">Generation Time:</span>
          <span className="font-bold text-gray-900">
            {generationTime < 1000 ? `${generationTime}ms` : `${(generationTime / 1000).toFixed(2)}s`}
          </span>
        </div>
      )}
      <div className="flex justify-between py-3 border-b border-gray-300">
        <span className="text-gray-600 font-medium">Generation Method:</span>
        <span className="font-bold text-gray-900">
          {isClientSide ? 'Static Templates' : 'GPT-4o-mini'}
        </span>
      </div>
      <div className="flex justify-between py-3">
        <span className="text-gray-600 font-medium">Data Source:</span>
        <span className="font-bold text-gray-900">
          {isClientSide ? 'Pre-configured Stories' : 'Qdrant Cloud'}
        </span>
      </div>
    </div>
  );
}