'use client';

import { useState } from 'react';
import { X, ChevronDown, ChevronUp, Database, Sparkles, Clock, Target } from 'lucide-react';
import { QdrantRetrievalMetadata } from '@/types/qdrant.types';

interface GenerationSummaryProps {
  metadata: QdrantRetrievalMetadata[];
  promptLength: number;
  adviceUsed: number;
  generationTime?: number;
}

export function GenerationSummary({ 
  metadata, 
  promptLength, 
  adviceUsed,
  generationTime 
}: GenerationSummaryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());

  const toggleCollection = (collectionName: string) => {
    setExpandedCollections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(collectionName)) {
        newSet.delete(collectionName);
      } else {
        newSet.add(collectionName);
      }
      return newSet;
    });
  };

  return (
    <>
      {/* Fixed Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg transition-all hover:scale-105 font-medium"
      >
        <Database className="h-5 w-5" />
        Generation Summary
        <span className="ml-1 px-2 py-0.5 bg-indigo-500 rounded-full text-xs">
          {adviceUsed}
        </span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Generation Summary</h2>
                  <p className="text-sm text-gray-600">How we personalized your page</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/80 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 border-b">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Database className="h-5 w-5 text-indigo-600" />
                  <span className="text-sm font-medium text-gray-600">Collections Used</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{metadata.length}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-600">Advice Retrieved</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{adviceUsed}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">Prompt Size</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{(promptLength / 1000).toFixed(1)}k</p>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {/* Qdrant Collections */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Database className="h-5 w-5 text-indigo-600" />
                  Qdrant Retrieval Details
                </h3>

                {metadata.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No Qdrant collections were used for this generation
                  </div>
                ) : (
                  <div className="space-y-3">
                    {metadata.map((collection, idx) => (
                      <div key={idx} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                        
                        {/* Collection Header */}
                        <button
                          onClick={() => toggleCollection(collection.collection)}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              collection.type === 'vector' 
                                ? 'bg-purple-100 text-purple-700' 
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {collection.type === 'vector' ? '🔮 Vector' : '📏 Rule-Based'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{collection.collection}</p>
                              <p className="text-sm text-gray-600">{collection.count} items retrieved</p>
                            </div>
                          </div>
                          {expandedCollections.has(collection.collection) ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </button>

                        {/* Collection Items (Expanded) */}
                        {expandedCollections.has(collection.collection) && (
                          <div className="px-4 pb-4 space-y-3 border-t bg-gray-50">
                            {collection.items.map((item, itemIdx) => (
                              <div key={itemIdx} className="bg-white p-4 rounded border">
                                {/* Title and Score */}
                                <div className="flex items-start justify-between mb-2">
                                  <p className="font-semibold text-gray-900 flex-1">{item.title}</p>
                                  {item.score !== undefined && (
                                    <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${
                                      item.score > 0.8 ? 'bg-green-100 text-green-700' :
                                      item.score > 0.6 ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-orange-100 text-orange-700'
                                    }`}>
                                      {(item.score * 100).toFixed(0)}% match
                                    </span>
                                  )}
                                </div>

                                {/* Advice/Description Text */}
                                {(item.advice || item.description) && (
                                  <div className="mb-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                      {item.advice || item.description}
                                    </p>
                                  </div>
                                )}
                                
                                {/* Tags */}
                                {item.tags && item.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {item.tags.map((tag, tagIdx) => (
                                      <span 
                                        key={tagIdx}
                                        className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Matched Rules */}
                                {item.matchedRules && (
                                  <div className="mt-2 pt-2 border-t text-xs text-gray-600">
                                    <p className="font-medium mb-1">Matched Rules:</p>
                                    <div className="pl-3 space-y-1">
                                      {item.matchedRules.flow && (
                                        <p>• Flow: <span className="font-medium">{item.matchedRules.flow.join(', ')}</span></p>
                                      )}
                                      {item.matchedRules.ruleGroups && (
                                        <p>• {item.matchedRules.ruleGroups.length} rule group(s) matched</p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Generation Details */}
              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Generation Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Prompt Length:</span>
                    <span className="font-medium text-gray-900">{promptLength.toLocaleString()} characters</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Total Advice Used:</span>
                    <span className="font-medium text-gray-900">{adviceUsed} items</span>
                  </div>
                  {generationTime && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Generation Time:</span>
                      <span className="font-medium text-gray-900">{generationTime.toFixed(2)}s</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Model:</span>
                    <span className="font-medium text-gray-900">GPT-4o-mini</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50 text-center">
              <p className="text-sm text-gray-600">
                This page was personalized using AI and real-time data from Qdrant
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}