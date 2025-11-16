import { AlertCircle, Sparkles } from 'lucide-react';

interface BeforeAfterComparisonProps {
  userInput: Record<string, string>;
  flow: string;
  adviceUsed: number;
  collectionsCount: number;
}

export function BeforeAfterComparison({ userInput, flow, adviceUsed, collectionsCount }: BeforeAfterComparisonProps) {
  return (
    <div className="space-y-3">
      {/* Without Personalization */}
      <div className="p-5 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl">
        <div className="flex items-start gap-3 mb-3">
          <AlertCircle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 mb-2">Without Personalization</h4>
            <p className="text-sm text-gray-700">Generic real estate advice that applies to everyone</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-3 py-1 bg-orange-200 text-orange-800 rounded-full font-medium">❌ No user context</span>
          <span className="px-3 py-1 bg-orange-200 text-orange-800 rounded-full font-medium">❌ No timeline matching</span>
          <span className="px-3 py-1 bg-orange-200 text-orange-800 rounded-full font-medium">❌ Generic steps</span>
        </div>
      </div>

      {/* With Personalization */}
      <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl">
        <div className="flex items-start gap-3 mb-3">
          <Sparkles className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 mb-2">AI-Powered Personalization</h4>
            <p className="text-sm text-gray-700">
              Tailored advice for YOUR {userInput.timeline || 'timeline'} {flow === 'buy' ? 'home search' : flow === 'sell' ? 'home sale' : 'journey'} 
              {userInput.buyingReason && ` as a ${userInput.buyingReason}`}
              {userInput.sellingReason && ` due to ${userInput.sellingReason}`}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full font-medium">✅ {adviceUsed} personalized insights</span>
          <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full font-medium">✅ {collectionsCount} data sources</span>
          <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full font-medium">✅ 100% relevant</span>
        </div>
      </div>
    </div>
  );
}