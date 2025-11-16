import { Download } from 'lucide-react';
import { QdrantRetrievalMetadata } from '@/types/qdrant.types';

interface DownloadReportButtonProps {
  metadata: QdrantRetrievalMetadata[];
  promptLength: number;
  adviceUsed: number;
  generationTime?: number;
  userInput: Record<string, string>;
  flow: string;
}

export function DownloadReportButton({
  metadata, promptLength, adviceUsed, generationTime, userInput, flow
}: DownloadReportButtonProps) {
  const handleDownload = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      userProfile: userInput,
      flow: flow,
      personalizationMetrics: {
        collectionsQueried: metadata.length,
        adviceRetrieved: adviceUsed,
        // averageMatchScore: (avgMatchScore * 100).toFixed(1) + '%',
        // rulesMatched: rulesMatched,
        promptSize: promptLength,
        generationTime: generationTime?.toFixed(2) + 's',
      },
      retrievedAdvice: metadata.map(m => ({
        collection: m.collection,
        type: m.type,
        itemCount: m.count,
        items: m.items.map(item => ({
          title: item.title,
          score: item.score,
          advice: item.advice,
          description: item.description,
          tags: item.tags,
        }))
      })),
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personalization-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
    >
      <Download className="h-6 w-6" />
      Download Full Personalization Report
    </button>
  );
}