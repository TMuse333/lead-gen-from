'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { Trash2, RefreshCw, Eye, EyeOff } from 'lucide-react';

interface AdviceItem {
  id: string;
  scenario: string;
  advice: string;
  tags: string[];
  propertyType: string[];
  sellingReason: string[];
  timeline: string[];
  createdAt: string;
}

interface ViewAgentAdviceProps {
   onSwitchToAdd?: () => void;
  }

  export default function ViewAgentAdvice({ onSwitchToAdd }: ViewAgentAdviceProps) {
  const [adviceList, setAdviceList] = useState<AdviceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAdvice = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/get-agent-advice', {
        params: {
        //   agentId: '182ae0d4d-c3d7-4997-bc7b-12b2261d167e', // TODO: Get from auth/session
          limit: 100,
        },
      });

      if (res.data.success) {
        setAdviceList(res.data.advice);
      } else {
        setError('Failed to load advice');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to load advice');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this advice?')) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await axios.delete('/api/get-agent-advice', {
        params: { id },
      });

      if (res.data.success) {
        setAdviceList(adviceList.filter((item) => item.id !== id));
      } else {
        alert('Failed to delete advice');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to delete advice');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchAdvice();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="text-center py-12">
          <RefreshCw className="animate-spin mx-auto mb-4 text-blue-600" size={40} />
          <p className="text-gray-600">Loading your advice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 mb-4">❌ {error}</p>
          <button
            onClick={fetchAdvice}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Advice Knowledge Base</h1>
          <p className="text-gray-600 mt-1">
            {adviceList.length} advice {adviceList.length === 1 ? 'piece' : 'pieces'} stored
          </p>
        </div>
        <button
          onClick={fetchAdvice}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Empty State */}
      {adviceList.length === 0 && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <p className="text-gray-600 mb-4">No advice added yet.</p>
          <a
            href="/add-advice"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Add Your First Advice
          </a>
        </div>
      )}

      {/* Advice List */}
      <div className="space-y-4">
        {adviceList.map((item) => {
          const isExpanded = expandedId === item.id;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition overflow-hidden"
            >
              {/* Header */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      {item.scenario}
                    </h3>

                    {/* Tags */}
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Metadata Pills */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {item.propertyType.length > 0 && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          🏠 {item.propertyType.join(', ')}
                        </span>
                      )}
                      {item.sellingReason.length > 0 && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                          💡 {item.sellingReason.join(', ')}
                        </span>
                      )}
                      {item.timeline.length > 0 && (
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                          ⏰ {item.timeline.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                      title={isExpanded ? 'Hide advice' : 'Show advice'}
                    >
                      {isExpanded ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                      title="Delete advice"
                    >
                      {deletingId === item.id ? (
                        <RefreshCw size={20} className="animate-spin" />
                      ) : (
                        <Trash2 size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Advice */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-4 pt-4 border-t border-gray-200"
                    >
                      <p className="text-sm font-semibold text-gray-700 mb-2">Your Advice:</p>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-800 whitespace-pre-wrap">{item.advice}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-3">
                        Added: {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add More CTA */}
      {adviceList.length > 0 && (
        <div className="mt-8 text-center">
          <button
          onClick={()=>onSwitchToAdd!()}
            className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition shadow-md"
          >
            ➕ Add More Advice
          </button>
        </div>
      )}
    </div>
  );
}