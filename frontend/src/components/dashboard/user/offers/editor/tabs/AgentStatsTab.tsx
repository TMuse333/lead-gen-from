// components/dashboard/user/offers/editor/tabs/AgentStatsTab.tsx
/**
 * Agent Stats Tab - Configure credibility stats shown in CompactTrustBar
 * These are OPTIONAL fields that enhance trust but are not required
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Save,
  Star,
  Calendar,
  TrendingUp,
  Users,
  Award,
  MapPin,
  Plus,
  X,
  Check,
  Loader2,
  Info,
  Sparkles,
} from 'lucide-react';
import type { AgentProfile } from '@/lib/userConfig/getUserConfig';

interface AgentStatsTabProps {
  agentProfile?: AgentProfile;
  onSave: (profile: AgentProfile) => Promise<void>;
}

export function AgentStatsTab({ agentProfile, onSave }: AgentStatsTabProps) {
  const [profile, setProfile] = useState<AgentProfile>({
    name: agentProfile?.name || '',
    yearsExperience: agentProfile?.yearsExperience || 0,
    ...agentProfile,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Input states for array fields
  const [newSpecialization, setNewSpecialization] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [newArea, setNewArea] = useState('');

  useEffect(() => {
    if (agentProfile) {
      setProfile(agentProfile);
    }
  }, [agentProfile]);

  const handleChange = <K extends keyof AgentProfile>(field: K, value: AgentProfile[K]) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const addToList = (field: 'specializations' | 'certifications' | 'areasServed', value: string) => {
    if (!value.trim()) return;
    const current = profile[field] || [];
    if (!current.includes(value.trim())) {
      handleChange(field, [...current, value.trim()]);
    }
    if (field === 'specializations') setNewSpecialization('');
    if (field === 'certifications') setNewCertification('');
    if (field === 'areasServed') setNewArea('');
  };

  const removeFromList = (field: 'specializations' | 'certifications' | 'areasServed', value: string) => {
    const current = profile[field] || [];
    handleChange(field, current.filter((v) => v !== value));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await onSave(profile);
      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save agent stats:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Count filled stats for the preview
  const filledStats = [
    profile.avgRating,
    profile.yearsExperience && profile.yearsExperience > 0,
    profile.totalTransactions,
    profile.similarClientsHelped,
    profile.certifications?.length,
    profile.areasServed?.length,
  ].filter(Boolean).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">
            Agent Credibility Stats
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Build trust with your leads by showcasing your experience
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
            ${hasChanges && !isSaving
              ? 'bg-cyan-600 text-white hover:bg-cyan-700'
              : saveSuccess
                ? 'bg-green-600 text-white'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }
          `}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : saveSuccess ? (
            <>
              <Check className="h-4 w-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Info Banner - ALL OPTIONAL */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-amber-300 font-medium">
            All fields are optional
          </p>
          <p className="text-sm text-amber-400/80 mt-1">
            Only fill in what you're comfortable sharing. These stats appear in a compact trust bar
            on your results page. Even without stats, your timeline will look great!
          </p>
          <p className="text-xs text-amber-500/70 mt-2">
            <Sparkles className="h-3 w-3 inline mr-1" />
            Tip: As you use the bot and get more clients, come back and update these stats to build even more trust.
          </p>
        </div>
      </div>

      {/* Preview */}
      {filledStats > 0 && (
        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
          <p className="text-xs text-slate-400 mb-3">Preview of your trust bar:</p>
          <div className="bg-white/5 rounded-lg py-3 px-4">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              {profile.avgRating && (
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span className="text-slate-200 font-medium">
                    {profile.avgRating}{profile.reviewCount ? ` (${profile.reviewCount})` : ''}
                  </span>
                </div>
              )}
              {profile.yearsExperience > 0 && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-200 font-medium">{profile.yearsExperience}+ Years</span>
                </div>
              )}
              {profile.totalTransactions && (
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-200 font-medium">{profile.totalTransactions}+ Sales</span>
                </div>
              )}
              {profile.similarClientsHelped && (
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-200 font-medium">{profile.similarClientsHelped} Like You</span>
                </div>
              )}
              {profile.certifications && profile.certifications[0] && (
                <div className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-200 font-medium">{profile.certifications[0]}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column: Core Stats */}
        <div className="space-y-6">
          {/* Experience & Transactions */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-md font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-cyan-500" />
              Experience & Track Record
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  value={profile.yearsExperience || ''}
                  onChange={(e) => handleChange('yearsExperience', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Total Transactions
                </label>
                <input
                  type="number"
                  value={profile.totalTransactions || ''}
                  onChange={(e) => handleChange('totalTransactions', parseInt(e.target.value) || undefined)}
                  placeholder="e.g., 150"
                  min="0"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Similar Clients Helped
              </label>
              <input
                type="number"
                value={profile.similarClientsHelped || ''}
                onChange={(e) => handleChange('similarClientsHelped', parseInt(e.target.value) || undefined)}
                placeholder="e.g., 42 first-time buyers"
                min="0"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                This shows as "X clients like you" based on user's situation
              </p>
            </div>
          </div>

          {/* Ratings */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-md font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-400" />
              Reviews & Ratings
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Average Rating
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.avgRating || ''}
                  onChange={(e) => handleChange('avgRating', parseFloat(e.target.value) || undefined)}
                  placeholder="e.g., 4.9"
                  min="0"
                  max="5"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Review Count
                </label>
                <input
                  type="number"
                  value={profile.reviewCount || ''}
                  onChange={(e) => handleChange('reviewCount', parseInt(e.target.value) || undefined)}
                  placeholder="e.g., 127"
                  min="0"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Pull these from your Google, Zillow, or Realtor.com profile
            </p>
          </div>
        </div>

        {/* Right Column: Lists */}
        <div className="space-y-6">
          {/* Certifications */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-md font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-400" />
              Certifications
            </h3>
            <div className="flex flex-wrap gap-2 mb-4 min-h-[32px]">
              {(profile.certifications || []).map((cert) => (
                <span
                  key={cert}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
                >
                  {cert}
                  <button
                    onClick={() => removeFromList('certifications', cert)}
                    className="ml-1 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {(!profile.certifications || profile.certifications.length === 0) && (
                <span className="text-sm text-slate-500 italic">No certifications added</span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addToList('certifications', newCertification)}
                placeholder="e.g., ABR, SRES, CRS..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => addToList('certifications', newCertification)}
                className="px-3 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Specializations */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-md font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-400" />
              Specializations
            </h3>
            <div className="flex flex-wrap gap-2 mb-4 min-h-[32px]">
              {(profile.specializations || []).map((spec) => (
                <span
                  key={spec}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm border border-cyan-500/30"
                >
                  {spec}
                  <button
                    onClick={() => removeFromList('specializations', spec)}
                    className="ml-1 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {(!profile.specializations || profile.specializations.length === 0) && (
                <span className="text-sm text-slate-500 italic">No specializations added</span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSpecialization}
                onChange={(e) => setNewSpecialization(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addToList('specializations', newSpecialization)}
                placeholder="e.g., First-Time Buyers, Luxury Homes..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => addToList('specializations', newSpecialization)}
                className="px-3 py-2 bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30 transition"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Areas Served */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-md font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-400" />
              Areas Served
            </h3>
            <div className="flex flex-wrap gap-2 mb-4 min-h-[32px]">
              {(profile.areasServed || []).map((area) => (
                <span
                  key={area}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm border border-green-500/30"
                >
                  {area}
                  <button
                    onClick={() => removeFromList('areasServed', area)}
                    className="ml-1 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {(!profile.areasServed || profile.areasServed.length === 0) && (
                <span className="text-sm text-slate-500 italic">No areas added</span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addToList('areasServed', newArea)}
                placeholder="e.g., Halifax, Dartmouth, Bedford..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => addToList('areasServed', newArea)}
                className="px-3 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
