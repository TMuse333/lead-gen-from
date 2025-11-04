'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Filter, Download, Phone, Mail, Eye,
  TrendingUp, Users, DollarSign, Clock
} from 'lucide-react';
import { ScoredLead, getTagColor, getTagIcon } from '@/lib/calc/leadScoring';
import LeadDetailModal from './detailModal';

export default function LeadDashboard() {
  const [leads, setLeads] = useState<ScoredLead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<ScoredLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState<'all' | 'hot' | 'warm' | 'cold'>('all');
  const [selectedLead, setSelectedLead] = useState<ScoredLead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    hot: 0,
    warm: 0,
    cold: 0,
    totalValue: 0,
  });

  // Fetch leads
  useEffect(() => {
    async function fetchLeads() {
      try {
        const response = await fetch('/api/leads');
        const data = await response.json();
        
        if (data.success) {
          setLeads(data.leads);
          setFilteredLeads(data.leads);
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeads();
  }, []);

  // Filter leads
  useEffect(() => {
    let filtered = leads;

    // Filter by tag
    if (tagFilter !== 'all') {
      filtered = filtered.filter(lead => lead.tag === tagFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.propertyProfile.type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLeads(filtered);
  }, [leads, tagFilter, searchTerm]);

  const handleViewLead = (lead: ScoredLead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lead Dashboard</h1>
          <p className="text-gray-600">Manage and track your seller leads</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="text-blue-600" />}
            label="Total Leads"
            value={stats.total}
            color="blue"
          />
          <StatCard
            icon={<span className="text-2xl">🔥</span>}
            label="Hot Leads"
            value={stats.hot}
            color="red"
          />
          <StatCard
            icon={<span className="text-2xl">⚡</span>}
            label="Warm Leads"
            value={stats.warm}
            color="amber"
          />
          <StatCard
            icon={<DollarSign className="text-green-600" />}
            label="Total Value"
            value={`$${(stats.totalValue / 1000000).toFixed(1)}M`}
            color="green"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by email or property type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tag Filter */}
            <div className="flex gap-2">
              {['all', 'hot', 'warm', 'cold'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setTagFilter(tag as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    tagFilter === tag
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag === 'all' ? 'All' : getTagIcon(tag as any)} {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </button>
              ))}
            </div>

            {/* Export */}
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition">
              <Download size={20} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Leads List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timeline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.map((lead, index) => (
                  <motion.tr
                    key={lead._id?.toString()}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getTagColor(lead.tag)}`}>
                          {getTagIcon(lead.tag)} {lead.score}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{lead.email}</div>
                        <div className="text-sm text-gray-500">{lead.propertyProfile.sellingReason}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{lead.propertyProfile.type || 'N/A'}</div>
                      {lead.propertyProfile.hasRenovations && (
                        <div className="text-xs text-green-600">✓ Renovated</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lead.propertyProfile.timeline || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lead.analysis?.estimatedValue ? (
                        <div className="text-sm font-medium text-gray-900">
                          ${lead.analysis.estimatedValue.low.toLocaleString()} - ${lead.analysis.estimatedValue.high.toLocaleString()}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(lead.submittedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleViewLead(lead)}
                          className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition"
                          title="View details"
                        >
                          <Eye size={18} />
                        </button>
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded transition"
                          title="Send email"
                        >
                          <Mail size={18} />
                        </a>
                        <a
                          href={`tel:${lead.propertyProfile.timeline}`}
                          className="text-purple-600 hover:text-purple-900 p-2 hover:bg-purple-50 rounded transition"
                          title="Call"
                        >
                          <Phone size={18} />
                        </a>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLeads.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No leads found matching your filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Lead Detail Modal */}
      <LeadDetailModal 
        lead={selectedLead}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 bg-${color}-50 rounded-lg`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}