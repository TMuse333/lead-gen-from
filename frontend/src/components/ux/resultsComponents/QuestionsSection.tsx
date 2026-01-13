// components/ux/resultsComponents/QuestionsSection.tsx
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
} from 'lucide-react';
import type { ColorTheme } from '@/lib/colors/defaultTheme';

interface AgentContact {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  photo?: string;
}

interface QuestionsSectionProps {
  /** Agent contact information */
  agentContact: AgentContact;
  /** User's name (pre-filled from contact collection) */
  userName?: string;
  /** User's email (pre-filled) */
  userEmail?: string;
  /** Conversation ID for linking the question */
  conversationId?: string;
  /** Color theme for dark mode support */
  colorTheme?: ColorTheme;
  /** Callback when question is submitted */
  onSubmit?: (data: { question: string; name: string; email: string }) => void;
}

/**
 * Section for leads to ask additional questions and see agent contact info
 */
export function QuestionsSection({
  agentContact,
  userName = '',
  userEmail = '',
  conversationId,
  colorTheme,
  onSubmit,
}: QuestionsSectionProps) {
  const hasCustomTheme = !!colorTheme;

  const [formData, setFormData] = useState({
    name: userName,
    email: userEmail,
    question: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Styles for theme support
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
      // Submit to API
      const response = await fetch('/api/lead-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          question: formData.question,
          conversationId,
          agentEmail: agentContact.email,
          agentName: agentContact.name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit question');
      }

      setIsSubmitted(true);
      onSubmit?.({
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

  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
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
              Have Questions?
            </span>
          </div>
          <h2
            className={`text-2xl md:text-3xl font-bold mb-3 ${hasCustomTheme ? '' : 'text-gray-900'}`}
            style={headingStyle}
          >
            Questions About Your Timeline?
          </h2>
          <p
            className={`max-w-xl mx-auto ${hasCustomTheme ? '' : 'text-gray-600'}`}
            style={subTextStyle}
          >
            This timeline is based on typical experiences. Have specific questions or concerns?
            Reach out directly or send a message below.
          </p>
        </div>

        {/* Two Column Layout: Agent Info + Question Form */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Agent Contact Card */}
          <div
            className={`rounded-2xl p-6 border ${hasCustomTheme ? '' : 'bg-white border-gray-200 shadow-md'}`}
            style={surfaceStyle}
          >
            <h3
              className={`text-lg font-bold mb-4 ${hasCustomTheme ? '' : 'text-gray-900'}`}
              style={headingStyle}
            >
              Contact {agentContact.name}
            </h3>

            <div className="flex items-start gap-4 mb-6">
              {agentContact.photo ? (
                <img
                  src={agentContact.photo}
                  alt={agentContact.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
                />
              ) : (
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center ${hasCustomTheme ? '' : 'bg-blue-100'}`}
                  style={hasCustomTheme ? { backgroundColor: `${colorTheme.primary}20` } : undefined}
                >
                  <User className={`h-8 w-8 ${hasCustomTheme ? '' : 'text-blue-600'}`} style={accentStyle} />
                </div>
              )}
              <div>
                <p
                  className={`font-bold text-lg ${hasCustomTheme ? '' : 'text-gray-900'}`}
                  style={headingStyle}
                >
                  {agentContact.name}
                </p>
                {agentContact.company && (
                  <p className={`text-sm ${hasCustomTheme ? '' : 'text-gray-600'}`} style={subTextStyle}>
                    {agentContact.company}
                  </p>
                )}
                <p className={`text-sm mt-1 ${hasCustomTheme ? '' : 'text-gray-500'}`} style={subTextStyle}>
                  Your dedicated real estate guide
                </p>
              </div>
            </div>

            {/* Contact Methods */}
            <div className="space-y-3">
              {agentContact.email && (
                <a
                  href={`mailto:${agentContact.email}?subject=Question%20About%20My%20Timeline`}
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
                      {agentContact.email}
                    </p>
                  </div>
                </a>
              )}

              {agentContact.phone && (
                <a
                  href={`tel:${agentContact.phone}`}
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
                      {agentContact.phone}
                    </p>
                  </div>
                </a>
              )}
            </div>

            <p className={`text-xs mt-4 ${hasCustomTheme ? '' : 'text-gray-500'}`} style={subTextStyle}>
              I typically respond within 24 hours
            </p>
          </div>

          {/* Question Form */}
          <div
            className={`rounded-2xl p-6 border ${hasCustomTheme ? '' : 'bg-white border-gray-200 shadow-md'}`}
            style={surfaceStyle}
          >
            {isSubmitted ? (
              // Success state
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
                  {agentContact.name} will get back to you soon with personalized answers.
                </p>
              </div>
            ) : (
              // Form
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

                {/* Name & Email (if not pre-filled) */}
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

                {/* Question textarea */}
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

                {/* Error message */}
                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}

                {/* Submit button */}
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
                      Send to {agentContact.name.split(' ')[0]}
                    </>
                  )}
                </button>

                <p className={`text-xs text-center ${hasCustomTheme ? '' : 'text-gray-500'}`} style={subTextStyle}>
                  Your message will be sent directly to {agentContact.name}
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
