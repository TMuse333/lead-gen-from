'use client';

import { useEffect, useState } from 'react';
import { 
  Mail, Phone, MapPin, Calendar, Eye, 
  ShoppingCart, Home, Eye as EyeIcon, 
  Loader2, ExternalLink, ChevronDown, ChevronUp,
  User, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Lead {
  id: string;
  conversationId: string;
  name: string;
  email: string;
  phone: string;
  propertyAddress: string;
  flow: string;
  offerType?: string;
  userInput: Record<string, string>;
  generation: {
    id: string;
    generatedAt: string;
    generationTime: number;
    componentCount: number;
    status: string;
    preview: string | null;
  };
  conversation: {
    id: string;
    startedAt: string;
    completedAt?: string;
    status: string;
    messageCount: number;
  } | null;
}

const FLOW_ICONS = {
  buy: ShoppingCart,
  sell: Home,
  browse: EyeIcon,
};

const FLOW_COLORS = {
  buy: 'from-blue-500 to-cyan-500',
  sell: 'from-green-500 to-emerald-500',
  browse: 'from-purple-500 to-pink-500',
};

export default function LeadsDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/leads?limit=100');
      if (!response.ok) throw new Error('Failed to fetch leads');
      const data = await response.json();
      setLeads(data.leads);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
            <p className="text-red-300">{error}</p>
            <button
              onClick={fetchLeads}
              className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-cyan-50 mb-2">Leads Dashboard</h1>
              <p className="text-slate-400">
                View all leads and their generated offers ({total} total)
              </p>
            </div>
            <button
              onClick={fetchLeads}
              className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 rounded-lg transition-colors flex items-center gap-2"
            >
              <Loader2 className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-white mb-1">{total}</div>
            <div className="text-sm text-white/80">Total Leads</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-white mb-1">
              {leads.filter(l => l.generation.status === 'success').length}
            </div>
            <div className="text-sm text-white/80">Successful Generations</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-white mb-1">
              {new Set(leads.map(l => l.email).filter(Boolean)).size}
            </div>
            <div className="text-sm text-white/80">Unique Contacts</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-white mb-1">
              {leads.filter(l => l.phone).length}
            </div>
            <div className="text-sm text-white/80">With Phone Numbers</div>
          </div>
        </div>

        {/* Leads List */}
        {leads.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-12 text-center border border-slate-700">
            <User className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <p className="text-xl text-slate-400 mb-2">No leads yet</p>
            <p className="text-slate-500">Leads will appear here once users complete conversations and receive generated offers.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leads.map((lead, index) => {
              const FlowIcon = FLOW_ICONS[lead.flow as keyof typeof FLOW_ICONS] || FileText;
              const flowColor = FLOW_COLORS[lead.flow as keyof typeof FLOW_COLORS] || 'from-slate-500 to-slate-600';
              const isExpanded = expandedLead === lead.id;

              return (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden"
                >
                  {/* Lead Header */}
                  <div
                    className="p-6 cursor-pointer hover:bg-slate-700/50 transition-colors"
                    onClick={() => setExpandedLead(isExpanded ? null : lead.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Flow Badge */}
                        <div className={`bg-gradient-to-br ${flowColor} rounded-lg p-3 flex-shrink-0`}>
                          <FlowIcon className="h-6 w-6 text-white" />
                        </div>

                        {/* Lead Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-cyan-50 truncate">
                              {lead.name}
                            </h3>
                            <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300 capitalize">
                              {lead.flow}
                            </span>
                            {lead.offerType && (
                              <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded text-xs capitalize">
                                {lead.offerType}
                              </span>
                            )}
                          </div>

                          {/* Contact Info */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            {lead.email && (
                              <div className="flex items-center gap-2 text-slate-300">
                                <Mail className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                                <span className="truncate">{lead.email}</span>
                              </div>
                            )}
                            {lead.phone && (
                              <div className="flex items-center gap-2 text-slate-300">
                                <Phone className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                                <span>{lead.phone}</span>
                              </div>
                            )}
                            {lead.propertyAddress && (
                              <div className="flex items-center gap-2 text-slate-300">
                                <MapPin className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                                <span className="truncate">{lead.propertyAddress}</span>
                              </div>
                            )}
                          </div>

                          {/* Generation Info */}
                          <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(lead.generation.generatedAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              <span>{lead.generation.componentCount} components</span>
                            </div>
                            {lead.conversation && (
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                <span>{lead.conversation.messageCount} messages</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expand Button */}
                      <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-0 border-t border-slate-700 space-y-4">
                          {/* Generation Details */}
                          <div className="bg-slate-900/50 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-cyan-300 mb-3 flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Generation Details
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="text-slate-400 mb-1">Status</div>
                                <div className={`font-semibold ${
                                  lead.generation.status === 'success' ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {lead.generation.status}
                                </div>
                              </div>
                              <div>
                                <div className="text-slate-400 mb-1">Generation Time</div>
                                <div className="text-cyan-300 font-semibold">
                                  {formatDuration(lead.generation.generationTime)}
                                </div>
                              </div>
                              <div>
                                <div className="text-slate-400 mb-1">Components</div>
                                <div className="text-cyan-300 font-semibold">
                                  {lead.generation.componentCount}
                                </div>
                              </div>
                              {lead.generation.preview && (
                                <div>
                                  <div className="text-slate-400 mb-1">Preview</div>
                                  <div className="text-cyan-300 font-semibold capitalize">
                                    {lead.generation.preview}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="mt-4">
                              <a
                                href={`/results?generationId=${lead.generation.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg transition-colors text-sm"
                              >
                                <Eye className="h-4 w-4" />
                                View Full Generation
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </div>

                          {/* User Input */}
                          <div className="bg-slate-900/50 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-cyan-300 mb-3 flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Collected Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {Object.entries(lead.userInput)
                                .filter(([key]) => !['email', 'phone', 'propertyAddress', 'Email', 'Phone', 'PropertyAddress', 'address'].includes(key))
                                .map(([key, value]) => (
                                  <div key={key} className="flex justify-between items-start">
                                    <span className="text-slate-400 text-sm capitalize">
                                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                                    </span>
                                    <span className="text-cyan-200 text-sm font-medium text-right ml-4">
                                      {String(value)}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>

                          {/* Conversation Info */}
                          {lead.conversation && (
                            <div className="bg-slate-900/50 rounded-lg p-4">
                              <h4 className="text-sm font-semibold text-cyan-300 mb-3 flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                Conversation Details
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <div className="text-slate-400 mb-1">Started</div>
                                  <div className="text-cyan-200">
                                    {formatDate(lead.conversation.startedAt)}
                                  </div>
                                </div>
                                {lead.conversation.completedAt && (
                                  <div>
                                    <div className="text-slate-400 mb-1">Completed</div>
                                    <div className="text-cyan-200">
                                      {formatDate(lead.conversation.completedAt)}
                                    </div>
                                  </div>
                                )}
                                <div>
                                  <div className="text-slate-400 mb-1">Status</div>
                                  <div className={`font-semibold capitalize ${
                                    lead.conversation.status === 'completed' ? 'text-green-400' : 'text-yellow-400'
                                  }`}>
                                    {lead.conversation.status}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-slate-400 mb-1">Messages</div>
                                  <div className="text-cyan-200 font-semibold">
                                    {lead.conversation.messageCount}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

