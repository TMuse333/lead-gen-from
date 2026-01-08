'use client';

import { useUserConfig } from '@/contexts/UserConfigContext';
import { Building2, Briefcase, Mail, Phone, MapPin, Gift, Database, CheckCircle2, Clock, Calendar, ExternalLink, Eye } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function ConfigSummary() {
  const { config, loading, error } = useUserConfig();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    business: true,
    offers: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
            <p className="text-red-300">{error || 'Configuration not found'}</p>
            <p className="text-red-400/70 mt-2 text-sm">Please complete onboarding first</p>
          </div>
        </div>
      </div>
    );
  }

  const botUrl = `/bot/${config.businessName}`;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-4xl font-bold text-cyan-50 mb-2">Configuration Summary</h1>
              <p className="text-slate-400">Complete overview of your bot setup and configuration</p>
            </div>
            <Link
              href={botUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
            >
              <Eye className="h-5 w-5" />
              <span>See Your Bot Live</span>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Bot URL Info Card */}
        <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-cyan-300 mb-1">Your Public Bot URL</p>
              <p className="text-cyan-50 font-mono text-sm break-all">
                {typeof window !== 'undefined' ? window.location.origin : ''}{botUrl}
              </p>
            </div>
            <Link
              href={botUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg transition-colors border border-cyan-500/30"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="text-sm">Open</span>
            </Link>
          </div>
        </div>

        {/* Stats Card */}
        <div className="mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 inline-block">
            <div className="flex items-center gap-3">
              <Gift className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-cyan-50">{config.selectedOffers?.length || 0}</p>
                <p className="text-sm text-slate-400">Active Offers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection('business')}
            className="w-full flex items-center justify-between p-6 hover:bg-slate-700/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Building2 className="h-6 w-6 text-cyan-400" />
              <h2 className="text-xl font-semibold text-cyan-50">Business Information</h2>
            </div>
            <span className="text-slate-400">{expandedSections.business ? '−' : '+'}</span>
          </button>
          {expandedSections.business && (
            <div className="px-6 pb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Business Name</p>
                  <p className="text-cyan-50 font-medium">{config.businessName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Industry</p>
                  <p className="text-cyan-50 font-medium">{config.industry}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Qdrant Collection</p>
                  <p className="text-cyan-50 font-medium font-mono text-sm">{config.qdrantCollectionName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {config.isActive ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                        <span className="text-green-400">Active</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 text-yellow-400" />
                        <span className="text-yellow-400">Inactive</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-2">Data Collection Preferences</p>
                <div className="flex flex-wrap gap-2">
                  {config.dataCollection?.map((item: string) => (
                    <span
                      key={item}
                      className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm flex items-center gap-2"
                    >
                      {item === 'email' && <Mail className="h-3 w-3" />}
                      {item === 'phone' && <Phone className="h-3 w-3" />}
                      {item === 'propertyAddress' && <MapPin className="h-3 w-3" />}
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-2">Onboarding Completed</p>
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(config.onboardingCompletedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Offers */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection('offers')}
            className="w-full flex items-center justify-between p-6 hover:bg-slate-700/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Gift className="h-6 w-6 text-purple-400" />
              <h2 className="text-xl font-semibold text-cyan-50">Offers</h2>
              <span className="text-sm text-slate-400">({config.selectedOffers?.length || 0} selected)</span>
            </div>
            <span className="text-slate-400">{expandedSections.offers ? '−' : '+'}</span>
          </button>
          {expandedSections.offers && (
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {config.selectedOffers?.map((offer: string) => (
                  <div key={offer} className="bg-slate-900/50 border border-slate-600 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="h-5 w-5 text-purple-400" />
                      <h3 className="font-semibold text-cyan-50 capitalize">{offer}</h3>
                    </div>
                    {offer === 'pdf' && <p className="text-sm text-slate-400">Downloadable PDF Guide</p>}
                    {offer === 'landingPage' && <p className="text-sm text-slate-400">Personalized Results Landing Page</p>}
                    {offer === 'video' && <p className="text-sm text-slate-400">Personalized Video Message</p>}
                    {offer === 'custom' && config.customOffer && (
                      <p className="text-sm text-slate-400">{config.customOffer}</p>
                    )}
                  </div>
                ))}
                {config.customOffer && config.selectedOffers?.includes('custom') && (
                  <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="h-5 w-5 text-blue-400" />
                      <h3 className="font-semibold text-cyan-50">Custom Offer</h3>
                    </div>
                    <p className="text-sm text-slate-300">{config.customOffer}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* System Info */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="h-6 w-6 text-cyan-400" />
              <h2 className="text-xl font-semibold text-cyan-50">System Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400 mb-1">Created At</p>
                <p className="text-slate-200">
                  {new Date(config.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <p className="text-slate-400 mb-1">Last Updated</p>
                <p className="text-slate-200">
                  {new Date(config.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

