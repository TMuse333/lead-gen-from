import { AIAnalysis, ComparableHome } from '@/types';
import { Home, TrendingUp, Phone, Mail } from 'lucide-react';

interface PDFResultsProps {
    analysis: AIAnalysis;
    comparableHomes: ComparableHome[];
    userEmail: string;
    agentInfo: { name: string; email: string; phone: string };
  }

export default function PDFResults({ analysis, comparableHomes, userEmail, agentInfo }: PDFResultsProps) {
  return (
    <div className="p-8 bg-white text-black text-sm leading-relaxed">
      <h1 className="text-2xl font-bold mb-6">Property Valuation Report</h1>
      <p className="mb-6">Prepared for: <strong>{userEmail}</strong></p>

      <h2 className="text-xl font-bold mb-2">Estimated Value</h2>
      <p className="text-3xl font-bold mb-4">
        ${analysis.estimatedValue.low.toLocaleString()} - ${analysis.estimatedValue.high.toLocaleString()}
      </p>
      <p className="mb-6">{analysis.estimatedValue.reasoning}</p>

      <h2 className="text-xl font-bold mb-2">Market Summary</h2>
      <p className="mb-6">{analysis.marketSummary}</p>

      <h2 className="text-xl font-bold mb-2">Personalized Advice</h2>
      <p className="mb-6 whitespace-pre-wrap">{analysis.personalizedAdvice}</p>

      <h2 className="text-xl font-bold mb-2">Next Steps</h2>
      <ol className="list-decimal pl-6 mb-6">
        {analysis.recommendedActions.map((a: string, i: number) => (
          <li key={i} className="mb-2">{a}</li>
        ))}
      </ol>

      <h2 className="text-xl font-bold mb-2">Comparable Properties</h2>
      {comparableHomes.slice(0, 3).map((h: any) => (
        <div key={h.id} className="mb-4 border-b pb-2">
          <p className="font-bold">{h.address}</p>
          <p className="text-sm">{h.propertyDetails.type} • {h.propertyDetails.bedrooms} bed • {h.propertyDetails.bathrooms} bath</p>
          <p className="font-bold">${h.saleInfo.soldPrice?.toLocaleString() || h.saleInfo.listPrice?.toLocaleString()} ({h.saleInfo.status})</p>
        </div>
      ))}

      <div className="mt-8 pt-8 border-t">
        <p className="font-bold">{agentInfo.name}</p>
        <p>{agentInfo.phone} • {agentInfo.email}</p>
      </div>
    </div>
  );
}