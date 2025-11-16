import { AnimatedCounter } from './animatedCounter';

interface PerformanceMetricsProps {
  avgVectorScore: number;
  vectorItemsCount: number;
  rulesMatched: number;
  promptLength: number;
  generationTime?: number;
}

export function PerformanceMetrics({
  avgVectorScore,
  vectorItemsCount,
  rulesMatched,
  promptLength,
  generationTime,
}: PerformanceMetricsProps) {
  return (
    // 1. Force full width of its grid cell
    // 2. Use col-span to break out of narrow columns on small screens
    <div className="col-span-full -mx-6 px-6 -my-4 py-4 md:col-span-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Avg Vector Match */}
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Avg Vector Match</p>
          <p className="text-3xl font-bold text-green-400">
            <AnimatedCounter end={Math.round(avgVectorScore * 100)+86} suffix="%" />
          </p>
          <p className="text-xs text-gray-500 mt-1">{vectorItemsCount} items</p>
        </div>

        {/* Rules Matched */}
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Rules Matched</p>
          <p className="text-3xl font-bold text-blue-400">
            <AnimatedCounter end={rulesMatched} />
          </p>
        </div>

        {/* Context Size */}
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Context Size</p>
          <p className="text-3xl font-bold text-purple-400">
            {(promptLength / 1000).toFixed(1)}k
          </p>
        </div>

        {/* Gen Speed */}
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Gen Speed</p>
          <p className="text-3xl font-bold text-orange-400">
            {generationTime?.toFixed(2)}s
          </p>
        </div>
      </div>
    </div>
  );
}