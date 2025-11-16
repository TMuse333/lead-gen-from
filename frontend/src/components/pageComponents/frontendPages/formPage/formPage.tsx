// app/form/page.tsx
"use client";

import { useRouter } from 'next/navigation';



import ChatWithTracker from '@/components/ux/chatWithTracker/chatWithTracker';


import axios from 'axios'
import { useEffect , useRef, useState} from 'react';
import MarketAnalysisDisplay from '@/components/ux/marketAnalysis/marketAnalysis';
import PropertyList from '@/components/ux/propertyList/propertyList';
import ViewAgentAdvice from '@/components/client/adviceDashboard/viewAgentAdvice';
import AgentAdviceUploader from '@/components/client/adviceDashboard/agentAdviceUploader';
import { useChatStore } from '@/stores/chatStore';
import { GameChat } from '@/components/ux/chatWithTracker/components/gameChat';


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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Get Your Free Home Valuation
          </h1>
          <p className="text-lg text-gray-600">
            Chat with Chris's AI assistant to get a personalized analysis
          </p>
        </div>

        {/* Chat Component */}
        <ChatWithTracker  />
        
       
      </div>
    </main>
  );
}