// app/form/page.tsx
"use client";

import { useRouter } from 'next/navigation';



import ChatWithTracker from '@/components/ux/chatWithTracker/chatWithTracker';


import axios from 'axios'
import { useEffect , useRef, useState} from 'react';
import MarketAnalysisDisplay from '@/components/ux/marketAnalysis/marketAnalysis';
import PropertyList from '@/components/ux/propertyList/propertyList';
import ViewAgentAdvice from '@/components/admin/adviceDashboard/viewAgentAdvice';
import AgentAdviceUploader from '@/components/admin/adviceDashboard/agentAdviceUploader';
import { useChatStore } from '@/stores/chatStore';
import { GameChat } from '@/components/ux/chatWithTracker/chat/gameChat';
import AuroraHero from '@/components/landingPage/auroraHero';
import WhyDifferentSection from '@/components/landingPage/whyDifferent';
import TechSpecs from '@/components/landingPage/techSpecs';
import Navbar from '@/components/landingPage/navbar';


export default function FormPage() {
  const router = useRouter();



  const [pageUrl, setPageUrl] = useState<string>('');

  useEffect(() => {
    setPageUrl(window.location.href);
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