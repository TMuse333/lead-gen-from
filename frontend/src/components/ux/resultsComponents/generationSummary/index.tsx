'use client';

import { useState } from 'react';
import { 
  X, Database, Sparkles, User, Workflow, AlertCircle, Brain, Clock
} from 'lucide-react';
import { QdrantRetrievalMetadata } from '@/types/qdrant.types';

import { StatsOverview } from './statsOverview';
import { PersonalizationJourney } from './personalizationJourney';
import { UserProfile } from './userProfile';
import { PerformanceMetrics } from './performanceMetrics';
import { BeforeAfterComparison } from './beforeAfterComparison';
import { CollectionsDetail } from './collectionsDetail';
import { TechnicalDetails } from './technicalDetails';
import { DownloadReportButton } from './downloadReportButton';

interface GenerationSummaryProps {
  metadata: QdrantRetrievalMetadata[];
  promptLength: number;
  adviceUsed: number;
  generationTime?: number;
  userInput: Record<string, string>;
  flow: string;
}

export function GenerationSummary(props: GenerationSummaryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());

  const toggleCollection = (collectionName: string) => {
    setExpandedCollections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(collectionName)) newSet.delete(collectionName);
      else newSet.add(collectionName);
      return newSet;
    });
  };

  const avgVectorScore = props.metadata
    .filter(m => m.type === 'vector')
    .flatMap(m => m.items)
    .filter(item => item.score !== undefined)
    .reduce((sum, item, _, arr) => arr.length > 0 ? sum + (item.score || 0) / arr.length : 0, 0);

  const vectorItemsCount = props.metadata
    .filter(m => m.type === 'vector')
    .reduce((sum, m) => sum + m.count, 0);

  const avgMatchScore = props.metadata
    .flatMap(m => m.items)
    .filter(item => item.score !== undefined)
    .reduce((sum, item, _, arr) => sum + (item.score || 0) / arr.length, 0);

  const rulesMatched = props.metadata
    .filter(m => m.type === 'rule')
    .reduce((sum, m) => sum + m.count, 0);

  const personalizationJourney = [
    {
      step: 1,
      title: "Analyzed Your Profile",
      description: `Identified you as a ${props.flow === 'buy' ? 'buyer' : props.flow === 'sell' ? 'seller' : 'browser'} ${props.userInput.timeline ? `looking to move within ${props.userInput.timeline}` : 'exploring the market'}`,
      icon: User,
      color: "from-blue-500 to-cyan-600",
    },
    {
      step: 2,
      title: "Searched Knowledge Base",
      description: `Queried ${props.metadata.length} specialized collections using vector similarity and rule-based matching`,
      icon: Database,
      color: "from-purple-500 to-pink-600",
    },
    {
      step: 3,
      title: "Matched Expert Advice",
      description: `Found ${props.adviceUsed} highly relevant insights from Chris's experience with ${props.flow === 'buy' ? 'buyers' : props.flow === 'sell' ? 'sellers' : 'clients'} like you`,
      icon: Brain,
      color: "from-orange-500 to-red-600",
    },
    {
      step: 4,
      title: "Crafted Personalized Plan",
      description: `Generated 6 customized sections tailored to your unique timeline, goals, and situation`,
      icon: Sparkles,
      color: "from-green-500 to-emerald-600",
    }
  ];

  return (
    <>
      {/* Fixed Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg shadow-lg transition-all hover:scale-105 font-medium"
      >
        <Database className="h-5 w-5" />
        AI Generation Summary
        <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
          {props.adviceUsed}
        </span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 ">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">AI Generation Summary</h2>
                  <p className="text-sm text-gray-600">See how we personalized your experience</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/80 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Stats Overview */}
              <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-600 text-white rounded-xl shadow-xl w-full">
                <StatsOverview 
                  collectionsCount={props.metadata.length}
                  insightsCount={props.adviceUsed}
                  avgMatchScore={avgMatchScore}
                />
              </div>

              {/* Personalization Journey Timeline */}
              <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-6 border-2 border-indigo-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Workflow className="h-6 w-6 text-indigo-600" />
                  Personalization Journey
                </h3>
                <PersonalizationJourney journey={personalizationJourney} />
              </div>

              {/* User Profile Fingerprint */}
              <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="h-6 w-6 text-blue-600" />
                  Your Unique Profile
                </h3>
                <UserProfile userInput={props.userInput} />
              </div>

              {/* AI Performance Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white rounded-xl shadow-xl
              ">
                <PerformanceMetrics 
                  avgVectorScore={avgVectorScore}
                  vectorItemsCount={vectorItemsCount}
                  rulesMatched={rulesMatched}
                  promptLength={props.promptLength}
                  generationTime={props.generationTime}
                />
              </div>

              {/* Before/After Comparison */}
              <BeforeAfterComparison 
                userInput={props.userInput}
                flow={props.flow}
                adviceUsed={props.adviceUsed}
                collectionsCount={props.metadata.length}
              />

              {/* Qdrant Collections Detail */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Database className="h-6 w-6 text-indigo-600" />
                  Knowledge Base Retrieval
                </h3>
                {props.metadata.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <Database className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No Qdrant collections were used for this generation</p>
                  </div>
                ) : (
                  <CollectionsDetail 
                    metadata={props.metadata}
                    expandedCollections={expandedCollections}
                    toggleCollection={toggleCollection}
                  />
                )}
              </div>

              {/* Technical Details */}
              <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="h-6 w-6 text-gray-600" />
                  Technical Details
                </h3>
                <TechnicalDetails 
                  promptLength={props.promptLength}
                  adviceUsed={props.adviceUsed}
                  generationTime={props.generationTime}
                />
              </div>

              {/* Download Button */}
              <DownloadReportButton {...props} />
            </div>

            {/* Footer */}
            <div className="p-5 border-t-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-center">
              <p className="text-sm text-gray-700 font-medium flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                This page was personalized using AI and real-time data from Qdrant
                <Sparkles className="h-4 w-4 text-indigo-600" />
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}