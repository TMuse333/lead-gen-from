// components/ux/shared/EstimateDisclaimer.tsx
'use client';

import { Info, MessageCircle, Phone, Mail } from 'lucide-react';
import type { ColorTheme } from '@/lib/colors/defaultTheme';

interface AgentContact {
  name?: string;
  email?: string;
  phone?: string;
}

interface EstimateDisclaimerProps {
  /** Variant determines size and prominence */
  variant?: 'inline' | 'card' | 'footer' | 'banner';
  /** Agent contact info for CTA */
  agentContact?: AgentContact;
  /** Custom message override */
  customMessage?: string;
  /** Show the CTA to contact agent */
  showCTA?: boolean;
  /** Color theme for dark mode support */
  colorTheme?: ColorTheme;
  /** Additional className */
  className?: string;
}

/**
 * Reusable disclaimer component that protects the agent by clarifying
 * that advice is based on estimates from experience, not guarantees.
 * Includes optional CTA to contact agent for personalized advice.
 */
export function EstimateDisclaimer({
  variant = 'inline',
  agentContact,
  customMessage,
  showCTA = true,
  colorTheme,
  className = '',
}: EstimateDisclaimerProps) {
  const hasCustomTheme = !!colorTheme;

  const defaultMessage = "This information is based on typical experiences with clients in similar situations — not a guarantee. Your agent will provide personalized guidance for your specific circumstances.";
  const message = customMessage || defaultMessage;

  // Styles based on theme
  const textStyle = hasCustomTheme ? { color: colorTheme.textSecondary } : undefined;
  const borderStyle = hasCustomTheme ? { borderColor: colorTheme.border } : undefined;
  const surfaceStyle = hasCustomTheme ? { backgroundColor: `${colorTheme.surface}80` } : undefined;
  const accentStyle = hasCustomTheme ? { color: colorTheme.primary } : undefined;

  // Inline variant - minimal, flows with content
  if (variant === 'inline') {
    return (
      <div className={`flex items-start gap-2 ${className}`}>
        <Info
          className={`h-3.5 w-3.5 flex-shrink-0 mt-0.5 ${hasCustomTheme ? '' : 'text-gray-400'}`}
          style={textStyle}
        />
        <p
          className={`text-xs leading-relaxed ${hasCustomTheme ? '' : 'text-gray-500'}`}
          style={textStyle}
        >
          {message}
          {showCTA && agentContact && (
            <span className="ml-1">
              <ContactLink agentContact={agentContact} colorTheme={colorTheme} />
            </span>
          )}
        </p>
      </div>
    );
  }

  // Card variant - subtle bordered box
  if (variant === 'card') {
    return (
      <div
        className={`rounded-lg border p-4 ${hasCustomTheme ? '' : 'bg-gray-50/50 border-gray-200'} ${className}`}
        style={hasCustomTheme ? { ...surfaceStyle, ...borderStyle } : undefined}
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-1.5 rounded-full ${hasCustomTheme ? '' : 'bg-gray-100'}`}
            style={hasCustomTheme ? { backgroundColor: `${colorTheme.border}` } : undefined}
          >
            <Info
              className={`h-4 w-4 ${hasCustomTheme ? '' : 'text-gray-500'}`}
              style={textStyle}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm leading-relaxed ${hasCustomTheme ? '' : 'text-gray-600'}`}
              style={textStyle}
            >
              {message}
            </p>
            {showCTA && agentContact && (
              <div className="mt-3">
                <ContactCTA agentContact={agentContact} colorTheme={colorTheme} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Banner variant - horizontal, good for top of sections
  if (variant === 'banner') {
    return (
      <div
        className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-lg border ${hasCustomTheme ? '' : 'bg-blue-50/50 border-blue-100'} ${className}`}
        style={hasCustomTheme ? { backgroundColor: `${colorTheme.primary}08`, borderColor: `${colorTheme.primary}20` } : undefined}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Info
            className={`h-4 w-4 flex-shrink-0 ${hasCustomTheme ? '' : 'text-blue-500'}`}
            style={accentStyle}
          />
          <p
            className={`text-sm ${hasCustomTheme ? '' : 'text-gray-600'}`}
            style={textStyle}
          >
            <span className={`font-medium ${hasCustomTheme ? '' : 'text-gray-700'}`}>
              Estimates based on experience
            </span>
            <span className="hidden sm:inline"> — your agent will confirm details for your situation.</span>
          </p>
        </div>
        {showCTA && agentContact && (
          <ContactCTA agentContact={agentContact} colorTheme={colorTheme} compact />
        )}
      </div>
    );
  }

  // Footer variant - very subtle, for page bottom
  if (variant === 'footer') {
    return (
      <div
        className={`text-center py-6 border-t ${hasCustomTheme ? '' : 'border-gray-200'} ${className}`}
        style={borderStyle}
      >
        <p
          className={`text-xs max-w-2xl mx-auto leading-relaxed ${hasCustomTheme ? '' : 'text-gray-500'}`}
          style={textStyle}
        >
          <Info className="h-3 w-3 inline-block mr-1 -mt-0.5" />
          {message}
        </p>
        {showCTA && agentContact && (
          <div className="mt-3">
            <ContactCTA agentContact={agentContact} colorTheme={colorTheme} />
          </div>
        )}
      </div>
    );
  }

  return null;
}

/**
 * Inline contact link for use within text
 */
function ContactLink({
  agentContact,
  colorTheme
}: {
  agentContact: AgentContact;
  colorTheme?: ColorTheme;
}) {
  const hasCustomTheme = !!colorTheme;
  const linkStyle = hasCustomTheme ? { color: colorTheme.primary } : undefined;

  if (agentContact.email) {
    return (
      <a
        href={`mailto:${agentContact.email}`}
        className={`font-medium hover:underline ${hasCustomTheme ? '' : 'text-blue-600'}`}
        style={linkStyle}
      >
        Contact {agentContact.name || 'your agent'} for personalized guidance.
      </a>
    );
  }

  if (agentContact.phone) {
    return (
      <a
        href={`tel:${agentContact.phone}`}
        className={`font-medium hover:underline ${hasCustomTheme ? '' : 'text-blue-600'}`}
        style={linkStyle}
      >
        Contact {agentContact.name || 'your agent'} for personalized guidance.
      </a>
    );
  }

  return (
    <span className={`font-medium ${hasCustomTheme ? '' : 'text-gray-700'}`}>
      Contact {agentContact.name || 'your agent'} for personalized guidance.
    </span>
  );
}

/**
 * CTA button/links for contacting agent
 */
function ContactCTA({
  agentContact,
  colorTheme,
  compact = false,
}: {
  agentContact: AgentContact;
  colorTheme?: ColorTheme;
  compact?: boolean;
}) {
  const hasCustomTheme = !!colorTheme;
  const buttonStyle = hasCustomTheme
    ? { backgroundColor: colorTheme.primary, color: '#fff' }
    : undefined;
  const linkStyle = hasCustomTheme ? { color: colorTheme.primary } : undefined;

  if (compact) {
    // Compact: single button
    if (agentContact.email) {
      return (
        <a
          href={`mailto:${agentContact.email}?subject=Question%20About%20My%20Timeline`}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full transition-all hover:scale-105 ${hasCustomTheme ? '' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          style={buttonStyle}
        >
          <Mail className="h-3.5 w-3.5" />
          Get Accurate Info
        </a>
      );
    }
    if (agentContact.phone) {
      return (
        <a
          href={`tel:${agentContact.phone}`}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full transition-all hover:scale-105 ${hasCustomTheme ? '' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          style={buttonStyle}
        >
          <Phone className="h-3.5 w-3.5" />
          Get Accurate Info
        </a>
      );
    }
    return null;
  }

  // Full: show available contact methods
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span
        className={`text-sm ${hasCustomTheme ? '' : 'text-gray-600'}`}
        style={hasCustomTheme ? { color: colorTheme.textSecondary } : undefined}
      >
        For accurate, personalized advice:
      </span>
      <div className="flex items-center gap-2">
        {agentContact.email && (
          <a
            href={`mailto:${agentContact.email}?subject=Question%20About%20My%20Timeline`}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all hover:scale-105 ${hasCustomTheme ? '' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            style={buttonStyle}
          >
            <Mail className="h-3.5 w-3.5" />
            Email {agentContact.name || 'Agent'}
          </a>
        )}
        {agentContact.phone && (
          <a
            href={`tel:${agentContact.phone}`}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border transition-all hover:scale-105 ${hasCustomTheme ? '' : 'border-blue-200 text-blue-600 hover:bg-blue-50'}`}
            style={hasCustomTheme ? { borderColor: `${colorTheme.primary}40`, ...linkStyle } : undefined}
          >
            <Phone className="h-3.5 w-3.5" />
            {agentContact.phone}
          </a>
        )}
      </div>
    </div>
  );
}

/**
 * Short inline disclaimer for tight spaces (e.g., near action items)
 */
export function MiniDisclaimer({
  colorTheme,
  className = '',
}: {
  colorTheme?: ColorTheme;
  className?: string;
}) {
  const hasCustomTheme = !!colorTheme;
  const textStyle = hasCustomTheme ? { color: colorTheme.textSecondary } : undefined;

  return (
    <p
      className={`text-xs italic ${hasCustomTheme ? '' : 'text-gray-400'} ${className}`}
      style={textStyle}
    >
      *Estimates based on similar client experiences
    </p>
  );
}

/**
 * Section header with built-in disclaimer
 */
export function SectionWithDisclaimer({
  title,
  children,
  agentContact,
  colorTheme,
  className = '',
}: {
  title: string;
  children: React.ReactNode;
  agentContact?: AgentContact;
  colorTheme?: ColorTheme;
  className?: string;
}) {
  const hasCustomTheme = !!colorTheme;
  const headingStyle = hasCustomTheme ? { color: colorTheme.text } : undefined;

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-4 mb-4">
        <h3
          className={`text-lg font-semibold ${hasCustomTheme ? '' : 'text-gray-900'}`}
          style={headingStyle}
        >
          {title}
        </h3>
        <MiniDisclaimer colorTheme={colorTheme} />
      </div>
      {children}
      {agentContact && (
        <div className="mt-4">
          <EstimateDisclaimer
            variant="inline"
            agentContact={agentContact}
            colorTheme={colorTheme}
            customMessage="Want more accurate details?"
          />
        </div>
      )}
    </div>
  );
}
