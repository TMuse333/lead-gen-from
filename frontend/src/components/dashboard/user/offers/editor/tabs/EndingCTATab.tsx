// components/dashboard/user/offers/editor/tabs/EndingCTATab.tsx
/**
 * Ending CTA Tab - Configure the questions/CTA section on results page
 * Phase 1: Headshot upload + contact fields
 * Phase 2: CTA style selector
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Save,
  MessageCircle,
  Phone,
  Mail,
  Calendar,
  Download,
  User,
  Building2,
  Clock,
  Eye,
  Check,
  Loader2,
} from 'lucide-react';
import { HeadshotUpload } from '@/components/dashboard/shared/HeadshotUpload';
import type { EndingCTAConfig, CTAStyle } from '@/lib/mongodb/models/clientConfig';

interface EndingCTATabProps {
  config?: EndingCTAConfig;
  onSave: (config: EndingCTAConfig) => Promise<void>;
}

const CTA_STYLES: Array<{
  id: CTAStyle;
  name: string;
  description: string;
  icon: React.ElementType;
}> = [
  {
    id: 'questions-form',
    name: 'Questions Form',
    description: 'Lead can send questions directly + see your contact info',
    icon: MessageCircle,
  },
  {
    id: 'contact-card',
    name: 'Contact Card',
    description: 'Prominently display your contact info without form',
    icon: User,
  },
  {
    id: 'calendly',
    name: 'Calendly Booking',
    description: 'Embed Calendly for direct booking (coming soon)',
    icon: Calendar,
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Just download & share buttons, no contact section',
    icon: Download,
  },
];

const DEFAULT_CONFIG: EndingCTAConfig = {
  displayName: '',
  style: 'questions-form',
  responseTimeText: 'I typically respond within 24 hours',
};

export function EndingCTATab({ config, onSave }: EndingCTATabProps) {
  const [formData, setFormData] = useState<EndingCTAConfig>(config || DEFAULT_CONFIG);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Reset form when config changes
  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  const handleChange = <K extends keyof EndingCTAConfig>(
    field: K,
    value: EndingCTAConfig[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleHeadshotUpload = (url: string) => {
    handleChange('headshot', url);
  };

  const handleHeadshotRemove = () => {
    setFormData((prev) => {
      const { headshot, ...rest } = prev;
      return rest as EndingCTAConfig;
    });
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await onSave(formData);
      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save CTA config:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">
            Ending CTA Settings
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Configure how the "Questions?" section appears on your results page
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium
            transition-all
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

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column: Profile & Contact */}
        <div className="space-y-6">
          {/* Your Profile Section */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-md font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-cyan-500" />
              Your Profile
            </h3>

            {/* Headshot Upload */}
            <div className="mb-6">
              <HeadshotUpload
                currentHeadshot={formData.headshot}
                agentName={formData.displayName}
                onUpload={handleHeadshotUpload}
                onRemove={handleHeadshotRemove}
              />
            </div>

            {/* Display Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Display Name *
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => handleChange('displayName', e.target.value)}
                placeholder="John Smith"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Title / Role
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Real Estate Agent"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Company / Brokerage
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={formData.company || ''}
                  onChange={(e) => handleChange('company', e.target.value)}
                  placeholder="ABC Realty"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Contact Methods */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-md font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Phone className="h-5 w-5 text-cyan-500" />
              Contact Methods
            </h3>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="agent@email.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Shown to leads and used for new lead notifications
              </p>
            </div>

            {/* Phone */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Calendly URL */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Calendly URL
                <span className="text-slate-500 font-normal ml-2">(optional)</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="url"
                  value={formData.calendlyUrl || ''}
                  onChange={(e) => handleChange('calendlyUrl', e.target.value)}
                  placeholder="https://calendly.com/your-link"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Used when "Calendly Booking" style is selected
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: CTA Style & Messaging */}
        <div className="space-y-6">
          {/* CTA Style Selector */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-md font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5 text-cyan-500" />
              CTA Style
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {CTA_STYLES.map((style) => {
                const Icon = style.icon;
                const isSelected = formData.style === style.id;
                const isDisabled = style.id === 'calendly'; // Coming soon

                return (
                  <button
                    key={style.id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleChange('style', style.id)}
                    className={`
                      relative p-4 rounded-xl border-2 text-left transition-all
                      ${isSelected
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : isDisabled
                          ? 'border-slate-700 bg-slate-800/30 opacity-50 cursor-not-allowed'
                          : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                      }
                    `}
                  >
                    {isDisabled && (
                      <span className="absolute top-2 right-2 text-[10px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded">
                        Soon
                      </span>
                    )}
                    <Icon className={`h-6 w-6 mb-2 ${isSelected ? 'text-cyan-500' : 'text-slate-400'}`} />
                    <p className={`text-sm font-medium ${isSelected ? 'text-cyan-400' : 'text-slate-300'}`}>
                      {style.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {style.description}
                    </p>
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <Check className="h-4 w-4 text-cyan-500" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Messaging */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-md font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-cyan-500" />
              Custom Messaging
            </h3>

            {/* Section Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Section Title
              </label>
              <input
                type="text"
                value={formData.sectionTitle || ''}
                onChange={(e) => handleChange('sectionTitle', e.target.value)}
                placeholder="Have Questions?"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Section Subtitle */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Section Subtitle
              </label>
              <input
                type="text"
                value={formData.sectionSubtitle || ''}
                onChange={(e) => handleChange('sectionSubtitle', e.target.value)}
                placeholder="This timeline is based on typical experiences..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Personal Message */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Personal Message
                <span className="text-slate-500 font-normal ml-2">(optional)</span>
              </label>
              <textarea
                value={formData.customMessage || ''}
                onChange={(e) => handleChange('customMessage', e.target.value)}
                placeholder="I'd love to help you navigate this process and answer any questions you might have..."
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            {/* Response Time */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Response Time Text
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={formData.responseTimeText || ''}
                  onChange={(e) => handleChange('responseTimeText', e.target.value)}
                  placeholder="I typically respond within 24 hours"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
