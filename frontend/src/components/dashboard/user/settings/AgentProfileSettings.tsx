'use client';

import { useState, useEffect } from 'react';
import { User, Save, Camera, Award, MapPin, Phone, Mail, Star, Briefcase, Plus, X, Loader2 } from 'lucide-react';
import type { AgentProfile } from '@/lib/userConfig/getUserConfig';

export default function AgentProfileSettings() {
  const [profile, setProfile] = useState<AgentProfile>({
    name: '',
    yearsExperience: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New field inputs
  const [newSpecialization, setNewSpecialization] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [newArea, setNewArea] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/config');
      const data = await res.json();
      if (data.success && data.config?.agentProfile) {
        setProfile(data.config.agentProfile);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/user/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentProfile: profile }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Profile saved successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save profile' });
    } finally {
      setSaving(false);
    }
  };

  const addToList = (field: 'specializations' | 'certifications' | 'areasServed', value: string) => {
    if (!value.trim()) return;
    const current = profile[field] || [];
    if (!current.includes(value.trim())) {
      setProfile({ ...profile, [field]: [...current, value.trim()] });
    }
    // Clear input
    if (field === 'specializations') setNewSpecialization('');
    if (field === 'certifications') setNewCertification('');
    if (field === 'areasServed') setNewArea('');
  };

  const removeFromList = (field: 'specializations' | 'certifications' | 'areasServed', value: string) => {
    const current = profile[field] || [];
    setProfile({ ...profile, [field]: current.filter(v => v !== value) });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <User className="h-7 w-7 text-cyan-400" />
          Agent Profile
        </h1>
        <p className="text-slate-400 mt-2">
          This is how you appear to leads in their personalized offers. Make a great first impression!
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-300' : 'bg-red-500/20 border border-red-500/30 text-red-300'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-8">
        {/* Basic Info */}
        <section className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-cyan-400" />
            Basic Information
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Full Name *</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                placeholder="Sarah MacLeod"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
              <input
                type="text"
                value={profile.title || ''}
                onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                placeholder="REALTOR®"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Company / Brokerage</label>
              <input
                type="text"
                value={profile.company || ''}
                onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                placeholder="Atlantic Realty Group"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Photo URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={profile.photo || ''}
                  onChange={(e) => setProfile({ ...profile, photo: e.target.value })}
                  className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  placeholder="https://..."
                />
                <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center overflow-hidden">
                  {profile.photo ? (
                    <img src={profile.photo} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="h-5 w-5 text-slate-500" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Experience & Stats */}
        <section className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-400" />
            Experience & Stats
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Years of Experience *</label>
              <input
                type="number"
                value={profile.yearsExperience}
                onChange={(e) => setProfile({ ...profile, yearsExperience: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Total Transactions</label>
              <input
                type="number"
                value={profile.totalTransactions || ''}
                onChange={(e) => setProfile({ ...profile, totalTransactions: parseInt(e.target.value) || undefined })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                min="0"
                placeholder="320"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Similar Clients Helped</label>
              <input
                type="number"
                value={profile.similarClientsHelped || ''}
                onChange={(e) => setProfile({ ...profile, similarClientsHelped: parseInt(e.target.value) || undefined })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                min="0"
                placeholder="42"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Average Rating</label>
              <input
                type="number"
                step="0.1"
                value={profile.avgRating || ''}
                onChange={(e) => setProfile({ ...profile, avgRating: parseFloat(e.target.value) || undefined })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                min="0"
                max="5"
                placeholder="4.9"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Review Count</label>
              <input
                type="number"
                value={profile.reviewCount || ''}
                onChange={(e) => setProfile({ ...profile, reviewCount: parseInt(e.target.value) || undefined })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                min="0"
                placeholder="127"
              />
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <Phone className="h-5 w-5 text-green-400" />
            Contact Information
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={profile.email || ''}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  placeholder="sarah@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="tel"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  placeholder="(902) 555-0123"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Specializations */}
        <section className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-400" />
            Specializations
          </h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {(profile.specializations || []).map((spec) => (
              <span key={spec} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30">
                {spec}
                <button onClick={() => removeFromList('specializations', spec)} className="ml-1 hover:text-red-400">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSpecialization}
              onChange={(e) => setNewSpecialization(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addToList('specializations', newSpecialization)}
              className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              placeholder="e.g., First-Time Buyers, Luxury Homes..."
            />
            <button
              onClick={() => addToList('specializations', newSpecialization)}
              className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </section>

        {/* Certifications */}
        <section className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-400" />
            Certifications
          </h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {(profile.certifications || []).map((cert) => (
              <span key={cert} className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-sm border border-amber-500/30">
                {cert}
                <button onClick={() => removeFromList('certifications', cert)} className="ml-1 hover:text-red-400">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCertification}
              onChange={(e) => setNewCertification(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addToList('certifications', newCertification)}
              className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              placeholder="e.g., ABR, SRES, CRS..."
            />
            <button
              onClick={() => addToList('certifications', newCertification)}
              className="px-4 py-2 bg-amber-500/20 text-amber-300 rounded-lg hover:bg-amber-500/30 transition"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </section>

        {/* Areas Served */}
        <section className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-400" />
            Areas Served
          </h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {(profile.areasServed || []).map((area) => (
              <span key={area} className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm border border-green-500/30">
                {area}
                <button onClick={() => removeFromList('areasServed', area)} className="ml-1 hover:text-red-400">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addToList('areasServed', newArea)}
              className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              placeholder="e.g., Halifax, Dartmouth, Bedford..."
            />
            <button
              onClick={() => addToList('areasServed', newArea)}
              className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={saveProfile}
            disabled={saving || !profile.name}
            className="flex items-center gap-2 px-6 py-3 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
