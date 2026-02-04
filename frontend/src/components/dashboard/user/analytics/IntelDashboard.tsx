// src/components/dashboard/user/analytics/IntelDashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { Search, MessageCircleQuestion, Lightbulb, AlertTriangle, FileText, Tag, Hash } from 'lucide-react';

interface IntelItem {
  id: string;
  clientId: string;
  conversationId?: string;
  type: 'question' | 'topic_interest' | 'pain_point' | 'content_request';
  content: string;
  summary: string;
  tags: string[];
  lead?: { name?: string; email?: string; phone?: string };
  environment?: 'test' | 'production';
  createdAt: string;
}

interface IntelDashboardProps {
  environment?: 'production' | 'test' | 'all';
}

const TYPE_CONFIG: Record<IntelItem['type'], { label: string; color: string; bg: string; icon: typeof MessageCircleQuestion }> = {
  question: { label: 'Question', color: 'text-blue-300', bg: 'bg-blue-500/20', icon: MessageCircleQuestion },
  topic_interest: { label: 'Interest', color: 'text-emerald-300', bg: 'bg-emerald-500/20', icon: Lightbulb },
  pain_point: { label: 'Pain Point', color: 'text-amber-300', bg: 'bg-amber-500/20', icon: AlertTriangle },
  content_request: { label: 'Content Request', color: 'text-purple-300', bg: 'bg-purple-500/20', icon: FileText },
};

export default function IntelDashboard({ environment = 'production' }: IntelDashboardProps) {
  const [items, setItems] = useState<IntelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<IntelItem['type'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchIntel() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (environment !== 'all') params.set('environment', environment);
        const res = await fetch(`/api/intel?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch intel');
        const data = await res.json();
        setItems(data.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load intel');
      } finally {
        setLoading(false);
      }
    }
    fetchIntel();
  }, [environment]);

  // Compute stats
  const typeCounts = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});

  const tagCounts = items.reduce<Record<string, number>>((acc, item) => {
    item.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {});

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  // Filter items
  const filtered = items.filter(item => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.content.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard label="Total Intel" value={items.length} color="text-cyan-400" />
        {(Object.keys(TYPE_CONFIG) as IntelItem['type'][]).map(type => (
          <StatCard
            key={type}
            label={TYPE_CONFIG[type].label}
            value={typeCounts[type] || 0}
            color={TYPE_CONFIG[type].color}
          />
        ))}
      </div>

      {/* Top Tags */}
      {topTags.length > 0 && (
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Top Topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {topTags.map(([tag, count]) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-700/60 hover:bg-slate-700 text-sm transition-colors"
              >
                <Tag className="w-3 h-3 text-cyan-400" />
                <span className="text-slate-200">{tag}</span>
                <span className="text-slate-500 text-xs">({count})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search intel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="flex gap-1">
          <FilterButton label="All" active={filterType === 'all'} onClick={() => setFilterType('all')} />
          {(Object.keys(TYPE_CONFIG) as IntelItem['type'][]).map(type => (
            <FilterButton
              key={type}
              label={TYPE_CONFIG[type].label}
              active={filterType === type}
              onClick={() => setFilterType(type)}
            />
          ))}
        </div>
      </div>

      {/* Intel Items List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          {items.length === 0 ? 'No intel gathered yet. Intel is captured when visitors ask questions or share interests in the chatbot.' : 'No items match your filters.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => {
            const config = TYPE_CONFIG[item.type];
            const Icon = config.icon;
            return (
              <div key={item.id} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${config.bg} shrink-0 mt-0.5`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                      {item.environment === 'test' && (
                        <span className="text-xs text-amber-400/60 px-1.5 py-0.5 rounded bg-amber-500/10">test</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-200 break-words">{item.content}</p>
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.tags.map(tag => (
                          <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}

function FilterButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
        active
          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
          : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-300'
      }`}
    >
      {label}
    </button>
  );
}
