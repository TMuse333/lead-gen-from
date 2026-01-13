// components/ux/resultsComponents/EndingCTA.tsx
/**
 * Unified Ending CTA component that supports multiple styles:
 * - questions-form: Contact card + question submission form (default)
 * - contact-card: Just the agent contact info prominently displayed
 * - calendly: Calendly embed (coming soon)
 * - minimal: Just download/share buttons, no contact section
 */
'use client';

import { useState } from 'react';
import {
  MessageCircle,
  Send,
  Phone,
  Mail,
  User,
  CheckCircle2,
  Loader2,
  HelpCircle,
  Calendar,
  Download,
  Share2,
  Clock,
  Building2,
} from 'lucide-react';
import type { ColorTheme } from '@/lib/colors/defaultTheme';
import type { EndingCTAConfig, CTAStyle } from '@/lib/mongodb/models/clientConfig';

interface EndingCTAProps {
  /** EndingCTA configuration from clientConfig */
  config: EndingCTAConfig;
  /** User's name (pre-filled from contact collection) */
  userName?: string;
  /** User's email (pre-filled) */
  userEmail?: string;
  /** Conversation ID for linking the question */
  conversationId?: string;
  /** Color theme for dark mode support */
  colorTheme?: ColorTheme;
  /** Callback when question is submitted */
  onQuestionSubmit?: (data: { question: string; name: string; email: string }) => void;
  /** Callback for download action */
  onDownload?: () => void;
  /** Callback for share action */
  onShare?: () => void;
}

/**
 * Unified Ending CTA component with multiple style variants
 */
export function EndingCTA({
  config,
  userName = '',
  userEmail = '',
  conversationId,
  colorTheme,
  onQuestionSubmit,
  onDownload,
  onShare,
}: EndingCTAProps) {
  const hasCustomTheme = !!colorTheme;
  const style = config.style || 'questions-form';

  // Form state (used by questions-form style)
  const [formData, setFormData] = useState({
    name: userName,
    email: userEmail,
    question: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Theme styles
  const surfaceStyle = hasCustomTheme
    ? { backgroundColor: colorTheme.surface, borderColor: colorTheme.border }
    : undefined;
  const headingStyle = hasCustomTheme ? { color: colorTheme.text } : undefined;
  const subTextStyle = hasCustomTheme ? { color: colorTheme.textSecondary } : undefined;
  const accentStyle = hasCustomTheme ? { color: colorTheme.primary } : undefined;
  const inputStyle = hasCustomTheme
    ? { backgroundColor: colorTheme.background, borderColor: colorTheme.border, color: colorTheme.text }
    : undefined;
  const buttonStyle = hasCustomTheme
    ? { backgroundColor: colorTheme.primary, color: '#fff' }
    : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.question.trim()) {
      setError('Please enter your question or message');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/lead-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          question: formData.question,
          conversationId,
          agentEmail: config.email,
          agentName: config.displayName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit question');
      }

      setIsSubmitted(true);
      onQuestionSubmit?.({
        question: formData.question,
        name: formData.name,
        email: formData.email,
      });
    } catch (err) {
      setError('Failed to send your question. Please try contacting the agent directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render section header
  const renderHeader = () => (
    <div className="text-center mb-8">
      <div
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${hasCustomTheme ? '' : 'bg-blue-50 border border-blue-100'}`}
        style={hasCustomTheme ? { backgroundColor: `${colorTheme.primary}15`, borderColor: `${colorTheme.primary}30` } : undefined}
      >
        <HelpCircle className={`h-4 w-4 ${hasCustomTheme ? '' : 'text-blue-600'}`} style={accentStyle} />
        <span
          className={`text-sm font-semibold ${hasCustomTheme ? '' : 'text-blue-700'}`}
          style={accentStyle}
        >
          {config.sectionTitle || 'Have Questions?'}
        </span>
      </div>
      <h2
        className={`text-2xl md:text-3xl font-bold mb-3 ${hasCustomTheme ? '' : 'text-gray-900'}`}
        style={headingStyle}
      >
        {config.sectionTitle || 'Questions About Your Timeline?'}
      </h2>
      <p
        className={`max-w-xl mx-auto ${hasCustomTheme ? '' : 'text-gray-600'}`}
        style={subTextStyle}
      >
        {config.sectionSubtitle || 'This timeline is based on typical experiences. Have specific questions or concerns? Reach out directly or send a message below.'}
      </p>
    </div>
  );

  // Render agent contact card
  const renderAgentCard = (fullWidth = false) => (
    <div
      className={`rounded-2xl p-6 border ${hasCustomTheme ? '' : 'bg-white border-gray-200 shadow-md'} ${fullWidth ? 'max-w-lg mx-auto' : ''}`}
      style={surfaceStyle}
    >
      <h3
        className={`text-lg font-bold mb-4 ${hasCustomTheme ? '' : 'text-gray-900'}`}
        style={headingStyle}
      >
        Contact {config.displayName}
      </h3>

      <div className="flex items-start gap-4 mb-6">
        {config.headshot ? (
          <img
            src={config.headshot}
            alt={config.displayName}
            className="w-32 h-32 lg:w-40 lg:h-40 rounded-full object-cover border-4 border-gray-200 shadow-lg"
          />
        ) : (
          <div
            className={`w-32 h-32 lg:w-40 lg:h-40 rounded-full flex items-center justify-center ${hasCustomTheme ? '' : 'bg-blue-100'}`}
            style={hasCustomTheme ? { backgroundColor: `${colorTheme.primary}20` } : undefined}
          >
            <User className={`h-16 w-16 lg:h-20 lg:w-20 ${hasCustomTheme ? '' : 'text-blue-600'}`} style={accentStyle} />
          </div>
        )}
        <div>
          <p
            className={`font-bold text-lg ${hasCustomTheme ? '' : 'text-gray-900'}`}
            style={headingStyle}
          >
            {config.displayName}
          </p>
          {config.title && (
            <p className={`text-sm ${hasCustomTheme ? '' : 'text-gray-600'}`} style={subTextStyle}>
              {config.title}
            </p>
          )}
          {config.company && (
            <p className={`text-sm flex items-center gap-1 ${hasCustomTheme ? '' : 'text-gray-500'}`} style={subTextStyle}>
              <Building2 className="h-3 w-3" />
              {config.company}
            </p>
          )}
        </div>
      </div>

      {/* Custom Message */}
      {config.customMessage && (
        <p className={`text-sm italic mb-4 ${hasCustomTheme ? '' : 'text-gray-600'}`} style={subTextStyle}>
          "{config.customMessage}"
        </p>
      )}

      {/* Contact Methods */}
      <div className="space-y-3">
        {config.email && (
          <a
            href={`mailto:${config.email}?subject=Question%20About%20My%20Timeline`}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-md ${hasCustomTheme ? '' : 'bg-gray-50 border-gray-200 hover:border-blue-300'}`}
            style={hasCustomTheme ? { backgroundColor: `${colorTheme.background}`, borderColor: colorTheme.border } : undefined}
          >
            <div
              className={`p-2 rounded-lg ${hasCustomTheme ? '' : 'bg-blue-100'}`}
              style={hasCustomTheme ? { backgroundColor: `${colorTheme.primary}20` } : undefined}
            >
              <Mail className={`h-5 w-5 ${hasCustomTheme ? '' : 'text-blue-600'}`} style={accentStyle} />
            </div>
            <div>
              <p className={`text-sm font-medium ${hasCustomTheme ? '' : 'text-gray-900'}`} style={headingStyle}>
                Email
              </p>
              <p className={`text-sm ${hasCustomTheme ? '' : 'text-blue-600'}`} style={accentStyle}>
                {config.email}
              </p>
            </div>
          </a>
        )}

        {config.phone && (
          <a
            href={`tel:${config.phone}`}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-md ${hasCustomTheme ? '' : 'bg-gray-50 border-gray-200 hover:border-blue-300'}`}
            style={hasCustomTheme ? { backgroundColor: `${colorTheme.background}`, borderColor: colorTheme.border } : undefined}
          >
            <div
              className={`p-2 rounded-lg ${hasCustomTheme ? '' : 'bg-green-100'}`}
              style={hasCustomTheme ? { backgroundColor: `${colorTheme.primary}20` } : undefined}
            >
              <Phone className={`h-5 w-5 ${hasCustomTheme ? '' : 'text-green-600'}`} style={accentStyle} />
            </div>
            <div>
              <p className={`text-sm font-medium ${hasCustomTheme ? '' : 'text-gray-900'}`} style={headingStyle}>
                Phone
              </p>
              <p className={`text-sm ${hasCustomTheme ? '' : 'text-green-600'}`} style={accentStyle}>
                {config.phone}
              </p>
            </div>
          </a>
        )}

        {config.calendlyUrl && (
          <a
            href={config.calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-md ${hasCustomTheme ? '' : 'bg-gray-50 border-gray-200 hover:border-purple-300'}`}
            style={hasCustomTheme ? { backgroundColor: `${colorTheme.background}`, borderColor: colorTheme.border } : undefined}
          >
            <div
              className={`p-2 rounded-lg ${hasCustomTheme ? '' : 'bg-purple-100'}`}
              style={hasCustomTheme ? { backgroundColor: `${colorTheme.primary}20` } : undefined}
            >
              <Calendar className={`h-5 w-5 ${hasCustomTheme ? '' : 'text-purple-600'}`} style={accentStyle} />
            </div>
            <div>
              <p className={`text-sm font-medium ${hasCustomTheme ? '' : 'text-gray-900'}`} style={headingStyle}>
                Schedule a Call
              </p>
              <p className={`text-sm ${hasCustomTheme ? '' : 'text-purple-600'}`} style={accentStyle}>
                Book a time to chat
              </p>
            </div>
          </a>
        )}
      </div>

      {config.responseTimeText && (
        <p className={`text-xs mt-4 flex items-center gap-1 ${hasCustomTheme ? '' : 'text-gray-500'}`} style={subTextStyle}>
          <Clock className="h-3 w-3" />
          {config.responseTimeText}
        </p>
      )}
    </div>
  );

  // Render question form
  const renderQuestionForm = () => (
    <div
      className={`rounded-2xl p-6 border ${hasCustomTheme ? '' : 'bg-white border-gray-200 shadow-md'}`}
      style={surfaceStyle}
    >
      {isSubmitted ? (
        <div className="h-full flex flex-col items-center justify-center text-center py-8">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${hasCustomTheme ? '' : 'bg-green-100'}`}
            style={hasCustomTheme ? { backgroundColor: `${colorTheme.primary}20` } : undefined}
          >
            <CheckCircle2 className={`h-8 w-8 ${hasCustomTheme ? '' : 'text-green-600'}`} style={accentStyle} />
          </div>
          <h3
            className={`text-xl font-bold mb-2 ${hasCustomTheme ? '' : 'text-gray-900'}`}
            style={headingStyle}
          >
            Message Sent!
          </h3>
          <p className={`${hasCustomTheme ? '' : 'text-gray-600'}`} style={subTextStyle}>
            {config.displayName} will get back to you soon with personalized answers.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className={`h-5 w-5 ${hasCustomTheme ? '' : 'text-blue-600'}`} style={accentStyle} />
            <h3
              className={`text-lg font-bold ${hasCustomTheme ? '' : 'text-gray-900'}`}
              style={headingStyle}
            >
              Send a Quick Message
            </h3>
          </div>

          {(!userName || !userEmail) && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${hasCustomTheme ? '' : 'text-gray-700'}`}
                  style={headingStyle}
                >
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${hasCustomTheme ? '' : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`}
                  style={inputStyle}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${hasCustomTheme ? '' : 'text-gray-700'}`}
                  style={headingStyle}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${hasCustomTheme ? '' : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`}
                  style={inputStyle}
                  placeholder="your@email.com"
                />
              </div>
            </div>
          )}

          <div>
            <label
              className={`block text-sm font-medium mb-1 ${hasCustomTheme ? '' : 'text-gray-700'}`}
              style={headingStyle}
            >
              Your Question or Concern
            </label>
            <textarea
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              rows={4}
              className={`w-full px-3 py-2 rounded-lg border text-sm resize-none ${hasCustomTheme ? '' : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`}
              style={inputStyle}
              placeholder="What questions do you have about your timeline? Any specific concerns about your situation?"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all hover:shadow-lg hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed ${hasCustomTheme ? '' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            style={buttonStyle}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Send to {config.displayName.split(' ')[0]}
              </>
            )}
          </button>

          <p className={`text-xs text-center ${hasCustomTheme ? '' : 'text-gray-500'}`} style={subTextStyle}>
            Your message will be sent directly to {config.displayName}
          </p>
        </form>
      )}
    </div>
  );

  // Render minimal style (download/share buttons only)
  const renderMinimal = () => (
    <div className="text-center">
      <h2
        className={`text-xl font-bold mb-4 ${hasCustomTheme ? '' : 'text-gray-900'}`}
        style={headingStyle}
      >
        Save Your Timeline
      </h2>
      <p className={`mb-6 ${hasCustomTheme ? '' : 'text-gray-600'}`} style={subTextStyle}>
        Download or share your personalized timeline to reference later.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={onDownload}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-lg ${hasCustomTheme ? '' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          style={buttonStyle}
        >
          <Download className="h-5 w-5" />
          Download PDF
        </button>
        <button
          onClick={onShare}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all border ${hasCustomTheme ? '' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          style={hasCustomTheme ? { backgroundColor: colorTheme.surface, borderColor: colorTheme.border, color: colorTheme.text } : undefined}
        >
          <Share2 className="h-5 w-5" />
          Share Timeline
        </button>
      </div>
    </div>
  );

  // Render Calendly embed placeholder (coming soon)
  const renderCalendly = () => (
    <div className="max-w-lg mx-auto">
      {renderAgentCard(true)}
      <div
        className={`mt-6 rounded-2xl p-8 border text-center ${hasCustomTheme ? '' : 'bg-white border-gray-200 shadow-md'}`}
        style={surfaceStyle}
      >
        <Calendar className={`h-12 w-12 mx-auto mb-4 ${hasCustomTheme ? '' : 'text-purple-600'}`} style={accentStyle} />
        <h3
          className={`text-xl font-bold mb-2 ${hasCustomTheme ? '' : 'text-gray-900'}`}
          style={headingStyle}
        >
          Schedule a Call
        </h3>
        <p className={`mb-4 ${hasCustomTheme ? '' : 'text-gray-600'}`} style={subTextStyle}>
          Book a time to discuss your timeline with {config.displayName}
        </p>
        {config.calendlyUrl ? (
          <a
            href={config.calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-lg ${hasCustomTheme ? '' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
            style={hasCustomTheme ? { backgroundColor: colorTheme.primary, color: '#fff' } : undefined}
          >
            <Calendar className="h-5 w-5" />
            Book on Calendly
          </a>
        ) : (
          <p className={`text-sm ${hasCustomTheme ? '' : 'text-gray-500'}`} style={subTextStyle}>
            Calendly booking coming soon
          </p>
        )}
      </div>
    </div>
  );

  // Render based on style
  const renderContent = () => {
    switch (style) {
      case 'questions-form':
        return (
          <div className="grid md:grid-cols-2 gap-8">
            {renderAgentCard()}
            {renderQuestionForm()}
          </div>
        );
      case 'contact-card':
        return renderAgentCard(true);
      case 'calendly':
        return renderCalendly();
      case 'minimal':
        return renderMinimal();
      default:
        return (
          <div className="grid md:grid-cols-2 gap-8">
            {renderAgentCard()}
            {renderQuestionForm()}
          </div>
        );
    }
  };

  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {style !== 'minimal' && renderHeader()}
        {renderContent()}
      </div>
    </section>
  );
}
