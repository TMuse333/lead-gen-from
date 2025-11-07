// components/LeadDetailModal.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, Calendar, Home, TrendingUp, MessageSquare, DollarSign } from 'lucide-react';
import { ScoredLead, getTagColor, getTagIcon } from '@/lib/calc/leadScoring';

interface LeadDetailModalProps {
  lead: ScoredLead | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function LeadDetailModal({ lead, isOpen, onClose }: LeadDetailModalProps) {
  if (!lead) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${getTagColor(lead.tag)} bg-white`}>
                      {getTagIcon(lead.tag)} {lead.tag.toUpperCase()} ({lead.score}/100)
                    </span>
                    <div>
                      <h2 className="text-2xl font-bold">{lead.email}</h2>
                      {lead.phoneNumber && ( // ← ADD THIS
    <p className="text-blue-100 text-sm">{lead.phoneNumber}</p>
  )}
                      <p className="text-blue-100 text-sm">
                        Submitted {new Date(lead.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-3">
                  <a
                    href={`mailto:${lead.email}`}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
                  >
                    <Mail size={18} />
                    Email
                  </a>
                  <a
                    href={`tel:${lead.email}`}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
                  >
                    <Phone size={18} />
                    {lead.phoneNumber ? 'Call' : 'No Phone'}
                  </a>
                  <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
                    <Calendar size={18} />
                    Schedule
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Property Profile */}
                  <Section
                    icon={<Home className="text-blue-600" size={20} />}
                    title="Property Profile"
                  >
                    <InfoRow label="Property Type" value={lead.propertyProfile.type || 'N/A'} />
                    <InfoRow 
                      label="Estimated Age" 
                      value={lead.propertyProfile.estimatedAge ? `~${lead.propertyProfile.estimatedAge} years` : 'N/A'} 
                    />
                    <InfoRow 
                      label="Renovations" 
                      value={lead.propertyProfile.hasRenovations ? '✓ Yes' : '✗ No'}
                      highlight={lead.propertyProfile.hasRenovations}
                    />
                    {lead.propertyProfile.renovationTypes && lead.propertyProfile.renovationTypes.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Renovation Types:</p>
                        <div className="flex flex-wrap gap-2">
                          {lead.propertyProfile.renovationTypes.map((type, i) => (
                            <span key={i} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <InfoRow 
                      label="Mortgage Status" 
                      value={lead.propertyProfile.mortgageStatus || 'N/A'} 
                    />
                  </Section>

                  {/* Selling Motivation */}
                  <Section
                    icon={<TrendingUp className="text-purple-600" size={20} />}
                    title="Selling Motivation"
                  >
                    <InfoRow 
                      label="Reason" 
                      value={lead.propertyProfile.sellingReason || 'N/A'}
                      highlight
                    />
                    <InfoRow 
                      label="Timeline" 
                      value={lead.propertyProfile.timeline || 'N/A'}
                      highlight={lead.propertyProfile.timeline === '0-3'}
                    />
                    {lead.propertyProfile.specificConcerns && (
                      <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-xs font-semibold text-amber-900 mb-1">Specific Concerns:</p>
                        <p className="text-sm text-amber-800">{lead.propertyProfile.specificConcerns}</p>
                      </div>
                    )}
                  </Section>

                  {/* Property Valuation */}
                  {lead.analysis?.estimatedValue && (
                    <Section
                      icon={<DollarSign className="text-green-600" size={20} />}
                      title="AI Valuation"
                    >
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                        <p className="text-2xl font-bold text-green-900 mb-1">
                          ${lead.analysis.estimatedValue.low.toLocaleString()} - ${lead.analysis.estimatedValue.high.toLocaleString()}
                        </p>
                        <p className="text-sm text-green-700">
                          {Math.round(lead.analysis.estimatedValue.confidence * 100)}% Confidence
                        </p>
                      </div>
                      {lead.analysis.marketInsights && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-gray-700 mb-1">Market Insights:</p>
                          <p className="text-sm text-gray-600">{lead.analysis.marketInsights}</p>
                        </div>
                      )}
                    </Section>
                  )}

                  {/* Agent Advice */}
                  {lead.analysis?.agentAdvice && (
                    <Section
                      icon={<MessageSquare className="text-indigo-600" size={20} />}
                      title="Personalized Advice"
                    >
                      <div className="text-sm text-gray-700 leading-relaxed max-h-48 overflow-y-auto">
                        {lead.analysis.agentAdvice.split('\n\n').map((paragraph, i) => (
                          <p key={i} className="mb-2">{paragraph}</p>
                        ))}
                      </div>
                    </Section>
                  )}
                </div>

                {/* Full Form Answers */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span>📝</span>
                    Complete Form Submission
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {lead.answers.map((answer, index) => (
                      <div key={index} className="border-b border-gray-200 pb-3 last:border-0">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          {answer.question}
                        </p>
                        <p className="text-sm text-gray-900">
                          {Array.isArray(answer.value) 
                            ? answer.value.join(', ') 
                            : answer.value}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Answered: {new Date(answer.answeredAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comparable Homes */}
                {lead.analysis?.comparableHomes && lead.analysis.comparableHomes.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      📊 Comparable Properties
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {lead.analysis.comparableHomes.slice(0, 4).map((comp, i) => (
                        <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
                          <p className="font-semibold text-gray-900">{comp.address}</p>
                          <p className="text-sm text-gray-600">
                            {comp.propertyDetails.type} • {comp.propertyDetails.bedrooms}bd/{comp.propertyDetails.bathrooms}ba
                            {comp.propertyDetails.squareFeet && ` • ${comp.propertyDetails.squareFeet.toLocaleString()} sqft`}
                          </p>
                          {comp.saleInfo.soldPrice && (
                            <p className="text-green-600 font-semibold mt-2">
                              Sold: ${comp.saleInfo.soldPrice.toLocaleString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Helper Components
function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600">{label}:</span>
      <span className={`text-sm font-medium ${highlight ? 'text-blue-600' : 'text-gray-900'}`}>
        {value}
      </span>
    </div>
  );
}