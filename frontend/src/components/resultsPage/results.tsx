'use client';

import { useEffect, useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import confetti from 'canvas-confetti';
import { Moon, Sun, FileText, Link, Mail } from 'lucide-react';

import HeroValueCard from './heroValueCard';
import MarketStatsGrid from './marketStatsGrid';
import AdviceAccordion from './adviceAccordion';
import NextSteps from './nextSteps';
import ComparablesGrid from './comparablesGrid';
import AgentCTA from './agentCTA';
import ExportMenu from './exportMenu';
import PDFResults from './pdfResults';

import type { AIAnalysis, ComparableHome } from '@/types';
import DownloadPDFButton from './downloadPdfButton';

interface ResultsPageProps {
  analysis: AIAnalysis;
  comparableHomes: ComparableHome[];
  userEmail: string;
}

export default function ResultsPage({ analysis, comparableHomes, userEmail }: ResultsPageProps) {
  const [isDark, setIsDark] = useState(false);
  const [isPdfMode, setIsPdfMode] = useState(false);
  const pdfContentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: pdfContentRef,
  });


  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const agentInfo = {
    name: 'Chris Crowell',
    email: process.env.NEXT_PUBLIC_AGENT_EMAIL || 'agent@example.com',
    phone: '(902) 555-0123',
  };

  return (
    <div className={`min-h-screen py-12 px-4 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      <div className="max-w-5xl mx-auto">
        {/* Header Controls */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-2">
            <button
              onClick={() => setIsPdfMode(false)}
              className={`px-4 py-2 rounded-lg font-medium transition ${!isPdfMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Interactive
            </button>
            <button
              onClick={() => setIsPdfMode(true)}
              className={`px-4 py-2 rounded-lg font-medium transition ${isPdfMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              PDF View
            </button>
          </div>
          <div className="flex gap-2">
            <ExportMenu 
            // onPrint={pdfContentRef!}
             userEmail={userEmail} agentEmail={agentInfo.email} />
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>

        {/* Success Banner */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border-l-4 border-green-500">
          <div className="flex items-center gap-3">
            <div className="text-green-500">Checkmark</div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Analysis Complete!</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Report sent to <span className="font-semibold">{userEmail}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {isPdfMode ? (
          <div>
           
          <div 
          ref={pdfContentRef}
          id="pdf-content">
            <PDFResults 
       
           
           
            analysis={analysis} 
            comparableHomes={comparableHomes}
            userEmail={userEmail}
            agentInfo={agentInfo} />
          </div>
       
    <div className='flex items-center
    justify-around mx-auto w-[40%] mt-4 bg-red-200'>

      
        <button
        onClick={handlePrint}
        className="px-4  bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition
   ">
          Print Report
        </button>
        <DownloadPDFButton 
  targetId="pdf-content" 
  filename="home-value-analysis.pdf" 
/>
</div>
  
          </div>
        ) : (
          <>
            <HeroValueCard value={analysis.estimatedValue} />
            <MarketStatsGrid summary={analysis.marketSummary} />
            <AdviceAccordion advice={analysis.personalizedAdvice} agentName={agentInfo.name} />
            <NextSteps actions={analysis.recommendedActions} />
            <ComparablesGrid homes={comparableHomes} summary={analysis.comparablesSummary} />
            <AgentCTA agentInfo={agentInfo} />
          </>
        )}
      </div>
    </div>
  );
}