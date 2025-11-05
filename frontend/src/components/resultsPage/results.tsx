// components/ResultsPage.tsx
// FULLY DYNAMIC — AUTO-ADAPTS TO SELL / BUY / VALUE
// Uses Zustand flow + extracted answers
// Qdrant-ready leads + MongoDB

'use client';
import { useEffect, useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import confetti from 'canvas-confetti';
import { Moon, Sun, FileText, Home, DollarSign, Heart } from 'lucide-react';
import HeroValueCard from './heroValueCard';
import MarketStatsGrid from './marketStatsGrid';
import AdviceAccordion from './adviceAccordion';
import NextSteps from './nextSteps';
import ComparablesGrid from './comparablesGrid';
import AgentCTA from './agentCTA';
import ExportMenu from './exportMenu';
import PDFResults from './pdfResults';
import DownloadPDFButton from './downloadPdfButton';
import { useChatStore, selectCurrentFlow, selectExtractedAnswers } from '@/stores/chatStore';
import type { AIAnalysis, ComparableHome, FormConfig } from '@/types';

interface ResultsPageProps {
  analysis: AIAnalysis;
  comparableHomes: ComparableHome[];
  userEmail: string;
}

export default function ResultsPage({ analysis, comparableHomes, userEmail }: ResultsPageProps) {
  const flow = useChatStore(selectCurrentFlow);
  const answers = useChatStore(selectExtractedAnswers);
  const [isDark, setIsDark] = useState(false);
  const [isPdfMode, setIsPdfMode] = useState(false);
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: pdfContentRef });

  useEffect(() => {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const agentInfo = {
    name: 'Chris Crowell',
    email: process.env.NEXT_PUBLIC_AGENT_EMAIL || 'chris@halifaxhomes.ca',
    phone: '(902) 555-0123',
  };

  // ——— FLOW-SPECIFIC CONTENT ———
  const flowConfig = {
    sell: {
      title: "Your Home Sale Strategy Is Ready!",
      subtitle: `We’ve analyzed your ${answers.find(a => a.questionId === 'propertyType')?.value || 'home'} in Halifax.`,
      icon: <Home className="w-8 h-8 text-green-600" />,
      heroTitle: "Estimated Sale Price",
      heroSubtitle: "Based on current market + your home details",
      nextSteps: [
        "Schedule your FREE staging consultation",
        "Lock in your listing photos (drone included)",
        "Go live on MLS in 72 hours",
      ],
      cta: "Launch My Sale →",
    },
    buy: {
      title: "Your Dream Home Blueprint Is Here!",
      subtitle: "We found homes matching your budget & timeline.",
      icon: <Heart className="w-8 h-8 text-pink-600" />,
      heroTitle: "Your Buying Power",
      heroSubtitle: "Pre-approved range + hidden gems",
      nextSteps: [
        "Get pre-approved in 24 hrs",
        "See 3 off-market listings",
        "Tour your top match this weekend",
      ],
      cta: "Find My Home →",
    },
    browse: {
      title: "Your Market Intelligence Report Is Ready!",
      subtitle: "Custom insights for your area & budget.",
      icon: <DollarSign className="w-8 h-8 text-blue-600" />,
      heroTitle: "Market Overview",
      heroSubtitle: "Real-time trends + opportunities",
      nextSteps: [
        "Download your market trends PDF",
        "Get alerts for your area",
        "Schedule a strategy call",
      ],
      cta: "Get Market Updates →",
    },
  };

  const config = flowConfig[flow || 'browse'];

  return (
    <div className={`min-h-screen py-12 px-4 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-3">
            <button
              onClick={() => setIsPdfMode(false)}
              className={`px-5 py-2.5 rounded-xl font-semibold transition ${!isPdfMode ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'bg-white text-gray-700 shadow'}`}
            >
              Live Preview
            </button>
            <button
              onClick={() => setIsPdfMode(true)}
              className={`px-5 py-2.5 rounded-xl font-semibold transition ${isPdfMode ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'bg-white text-gray-700 shadow'}`}
            >
              PDF Version
            </button>
          </div>
          <div className="flex gap-3">
            <ExportMenu userEmail={userEmail} agentEmail={agentInfo.email} />
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Success Banner */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 mb-10 border-l-8 border-gradient-to-r from-blue-500 to-purple-500">
          <div className="flex items-center gap-5">
            {/* {config.icon|| 'oops'} || '' */}
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {config.title}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
                {config.subtitle}
                <br />
                <span className="font-bold text-blue-600">Report sent to {userEmail}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {isPdfMode ? (
          <div>
            <div ref={pdfContentRef} id="pdf-content">
              <PDFResults
                analysis={analysis}
                comparableHomes={comparableHomes}
                userEmail={userEmail}
                agentInfo={agentInfo}
                flow={flow || 'browse'}
              />
            </div>
            <div className="flex justify-center gap-6 mt-8">
              <button
                onClick={handlePrint}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-2xl transition flex items-center gap-3"
              >
                <FileText size={24} />
                Print Report
              </button>
              <DownloadPDFButton targetId="pdf-content" filename={`${flow}-report-${userEmail}.pdf`} />
            </div>
          </div>
        ) : (
          <>
            <HeroValueCard
              value={analysis.estimatedValue}
              title={config.heroTitle}
              subtitle={config.heroSubtitle}
              flow={flow || 'browse'}
            />
            <MarketStatsGrid summary={analysis.marketSummary} flow={flow || 'browse'} />
            <AdviceAccordion advice={analysis.personalizedAdvice} agentName={agentInfo.name} flow={flow || 'browse'} />
            <NextSteps actions={config.nextSteps} cta={config.cta} />
            <ComparablesGrid homes={comparableHomes} summary={analysis.comparablesSummary} />
            <AgentCTA agentInfo={agentInfo} flow={flow || 'browse'} />
          </>
        )}
      </div>
    </div>
  );
}