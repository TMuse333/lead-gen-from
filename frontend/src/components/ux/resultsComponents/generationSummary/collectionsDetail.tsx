import { Database, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { QdrantRetrievalMetadata } from '@/types/qdrant.types';

interface CollectionsDetailProps {
  metadata: QdrantRetrievalMetadata[];
  expandedCollections: Set<string>;
  toggleCollection: (collectionName: string) => void;
}

export function CollectionsDetail({ metadata, expandedCollections, toggleCollection }: CollectionsDetailProps) {
  return (
    <div className="space-y-3">
      {metadata.map((collection, idx) => (
        <div key={idx} className="border-2 rounded-xl overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow">
          {/* Collection Header */}
          <button
            onClick={() => toggleCollection(collection.collection)}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm ${
                collection.type === 'vector' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
              }`}>
                {collection.type === 'vector' ? '🔮 Vector Search' : '📋 Rule Engine'}
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900 text-lg">{collection.collection}</p>
                <p className="text-sm text-gray-600">
                  {collection.count} {collection.count === 1 ? 'item' : 'items'} retrieved
                </p>
              </div>
            </div>
            {expandedCollections.has(collection.collection) ? (
              <ChevronUp className="h-6 w-6 text-gray-400" />
            ) : (
              <ChevronDown className="h-6 w-6 text-gray-400" />
            )}
          </button>

          {/* Collection Items (Expanded) */}
          {expandedCollections.has(collection.collection) && (
            <div className="px-5 pb-5 space-y-4 border-t-2 bg-gradient-to-br from-gray-50 to-white">
              {collection.items.map((item, itemIdx) => (
                <div key={itemIdx} className="bg-white p-5 rounded-lg border-2 border-gray-200 shadow-sm hover:border-indigo-300 transition-colors">
                  {/* Title and Score */}
                  <div className="flex items-start justify-between mb-3">
                    <p className="font-bold text-gray-900 text-lg flex-1 pr-4">{item.title}</p>
                    {item.score !== undefined && (
                      <div className="flex-shrink-0">
                        <span className={`px-3 py-1 rounded-lg text-sm font-bold shadow-sm ${
                          item.score > 0.8 ? 'bg-green-100 text-green-700 border-2 border-green-300' :
                          item.score > 0.6 ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300' :
                          'bg-orange-100 text-orange-700 border-2 border-orange-300'
                        }`}>
                          {(item.score * 100).toFixed(0)}% match
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confidence Bar */}
                  {item.score !== undefined && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Relevance Score</span>
                        <span className="text-xs font-bold text-indigo-600">
                          {(item.score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ${
                            item.score > 0.8 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                            item.score > 0.6 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                            'bg-gradient-to-r from-orange-400 to-orange-600'
                          }`}
                          style={{ width: `${item.score * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Advice/Description Text */}
                  {(item.advice || item.description) && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-indigo-500 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-800 leading-relaxed font-medium">
                        {item.advice || item.description}
                      </p>
                    </div>
                  )}
                  
                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {item.tags.map((tag, tagIdx) => (
                        <span 
                          key={tagIdx}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold border border-gray-300"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Matched Rules */}
                  {item.matchedRules && (
                    <div className="mt-4 pt-4 border-t-2 border-gray-200">
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Why This Matched:</p>
                      <div className="pl-3 space-y-1.5 text-sm text-gray-700">
                        {item.matchedRules.flow && (
                          <p className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600" />
                            <span>Flow: <span className="font-bold text-indigo-600">{item.matchedRules.flow.join(', ')}</span></span>
                          </p>
                        )}
                        {item.matchedRules.ruleGroups && (
                          <p className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600" />
                            <span><span className="font-bold text-indigo-600">{item.matchedRules.ruleGroups.length}</span> rule group(s) matched your profile</span>
                          </p>
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
  );
}