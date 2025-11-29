// app/form/page.tsx
"use client";

import { useRouter } from 'next/navigation';



import ChatWithTracker from '@/components/ux/chatWithTracker/chatWithTracker';


import axios from 'axios'
import { useEffect , useRef, useState} from 'react';
import MarketAnalysisDisplay from '@/components/ux/marketAnalysis/marketAnalysis';
import PropertyList from '@/components/ux/propertyList/propertyList';
import ViewAgentAdvice from '@/components/dashboard/user/adviceDashboard/viewAgentAdvice';
import AgentAdviceUploader from '@/components/dashboard/user/adviceDashboard/agentAdviceUploader';
import { useChatStore } from '@/stores/chatStore';
import { GameChat } from '@/components/ux/chatWithTracker/chat/gameChat';
import AuroraHero from '@/components/landingPage/auroraHero';
import WhyDifferentSection from '@/components/landingPage/whyDifferent';
import TechSpecs from '@/components/landingPage/techSpecs';
import Navbar from '@/components/landingPage/navbar';
import { UserProfilePanel } from '@/components/debug/userProfilePanel';
import { DEFAULT_THEME } from '@/lib/colors/defaultTheme';
import { injectColorTheme } from '@/lib/colors/colorUtils';


export default function FormPage() {
  const router = useRouter();



  const [pageUrl, setPageUrl] = useState<string>('');

  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  // Scroll to top on page load to prevent auto-scroll to chatbot container
  useEffect(() => {
    // Scroll to top immediately
    window.scrollTo(0, 0);
    
    // Also handle hash navigation - prevent auto-scroll if hash exists
    if (window.location.hash) {
      // Remove hash from URL without scrolling
      const hash = window.location.hash;
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      
      // Optionally, you can scroll to the element after a delay if needed
      // But for now, we'll just prevent the auto-scroll
    }
    
    // Inject default theme for homepage (if no client config)
    const existingTheme = document.getElementById('bot-color-theme');
    if (!existingTheme) {
      injectColorTheme(DEFAULT_THEME);
    }
  }, []);




//   console.log('Submitting form with:');
// console.log('Answers:', extractedAnswers);
// console.log('Flow:', currentFlow);
// console.log('Page URL:', pageUrl);

  // Handle form completion with redirect


  const calledRef = useRef(false);
  

  

  return (
    <main className="min-h-screen bg-[#0a1525] relative">
      <Navbar/>
      <AuroraHero/>
      <WhyDifferentSection/>
      <TechSpecs/>


      <div className="container mx-auto px-4">
        {/* Header */}
        
        {/* <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Get Your Free Home Valuation
          </h1>
          <p className="text-lg text-gray-600">
            Chat with Chris's AI assistant to get a personalized analysis
          </p>
        </div> */}

        {/* Chat Component */}
        <ChatWithTracker  />
        
       
      </div>
    </main>
  );
}