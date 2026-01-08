// components/ux/resultsComponents/timeline/components/AgentExpertise.tsx
'use client';

import { Star, Award, Users, MapPin, CheckCircle2, TrendingUp, Calendar, Shield } from 'lucide-react';

export interface AgentCredentials {
  name: string;
  title?: string;
  company?: string;
  photo?: string;
  yearsExperience: number;
  totalTransactions?: number;
  transactionsInArea?: number;
  similarClientsHelped?: number;
  specializations?: string[];
  certifications?: string[];
  avgRating?: number;
  reviewCount?: number;
  areasServed?: string[];
  email?: string;
  phone?: string;
}

interface AgentExpertiseProps {
  agent: AgentCredentials;
  userSituation: {
    location?: string;
    isFirstTime?: boolean;
    budget?: string;
    flow: string;
  };
  accentColor: string;
}

/**
 * Agent expertise section showing credentials and relevant experience
 * Builds trust through specific, relevant proof points
 */
export function AgentExpertise({ agent, userSituation, accentColor }: AgentExpertiseProps) {
  // Generate relevant experience bullets based on user situation
  const relevantExperience: string[] = [];

  if (agent.similarClientsHelped && agent.similarClientsHelped > 0) {
    const clientType = userSituation.isFirstTime ? 'first-time buyers' : 'clients';
    relevantExperience.push(`Helped ${agent.similarClientsHelped} ${clientType} like you`);
  }

  if (agent.transactionsInArea && userSituation.location) {
    relevantExperience.push(`${agent.transactionsInArea} transactions in ${userSituation.location}`);
  }

  if (agent.specializations?.length) {
    const relevant = agent.specializations.slice(0, 2);
    relevantExperience.push(`Specialist in ${relevant.join(' & ')}`);
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm">
      {/* Agent header */}
      <div className="p-6 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-5">
          {/* Photo */}
          {agent.photo ? (
            <img
              src={agent.photo}
              alt={agent.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
            />
          ) : (
            <div className={`w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-2xl font-bold border-4 border-white shadow-md`}>
              {agent.name.split(' ').map(n => n[0]).join('')}
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-gray-900">{agent.name}</h3>
              <span title="Verified Agent">
                <Shield className="h-5 w-5 text-blue-500" />
              </span>
            </div>
            {agent.title && (
              <p className="text-gray-600">{agent.title}</p>
            )}
            {agent.company && (
              <p className="text-sm text-gray-500">{agent.company}</p>
            )}

            {/* Rating */}
            {agent.avgRating && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(agent.avgRating!) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-700">{agent.avgRating}</span>
                {agent.reviewCount && (
                  <span className="text-sm text-gray-500">({agent.reviewCount} reviews)</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 border-b border-gray-200">
        <div className="p-4 text-center border-r border-gray-200">
          <Calendar className="h-5 w-5 text-gray-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-gray-900">{agent.yearsExperience}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Years Exp.</div>
        </div>
        {agent.totalTransactions && (
          <div className="p-4 text-center border-r border-gray-200">
            <TrendingUp className="h-5 w-5 text-gray-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-gray-900">{agent.totalTransactions}+</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Transactions</div>
          </div>
        )}
        {agent.areasServed && (
          <div className="p-4 text-center">
            <MapPin className="h-5 w-5 text-gray-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-gray-900">{agent.areasServed.length}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Areas Served</div>
          </div>
        )}
      </div>

      {/* Relevant experience - personalized */}
      {relevantExperience.length > 0 && (
        <div className="p-5 bg-blue-50/50">
          <div className="flex items-center gap-2 mb-3">
            <Users className={`h-5 w-5 ${accentColor}`} />
            <h4 className="font-semibold text-gray-900">Relevant Experience</h4>
          </div>
          <ul className="space-y-2">
            {relevantExperience.map((exp, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                {exp}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Certifications */}
      {agent.certifications && agent.certifications.length > 0 && (
        <div className="p-5 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Award className={`h-5 w-5 ${accentColor}`} />
            <h4 className="font-semibold text-gray-900">Certifications</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {agent.certifications.map((cert, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200 font-medium"
              >
                <Award className="h-3 w-3" />
                {cert}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Contact CTA */}
      {(agent.email || agent.phone) && (
        <div className="p-5 bg-gradient-to-r from-blue-500 to-cyan-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">Ready to get started?</p>
              <p className="text-blue-100 text-sm">I'm here to help with your journey</p>
            </div>
            <div className="flex gap-2">
              {agent.email && (
                <a
                  href={`mailto:${agent.email}`}
                  className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold text-sm hover:bg-blue-50 transition"
                >
                  Email
                </a>
              )}
              {agent.phone && (
                <a
                  href={`tel:${agent.phone}`}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg font-semibold text-sm hover:bg-white/30 transition"
                >
                  Call
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
