// app/form/page.tsx
"use client";

import { useRouter } from 'next/navigation';

import { useChatStore } from '@/stores/chatStore';
import { ExtractedAnswer } from '@/types/chat.types';
import ChatWithTracker from '@/components/chatWithTracker/chatWithTracker';

export default function FormPage() {
  const router = useRouter();
  const reset = useChatStore((state) => state.reset);

  // Handle form completion with redirect
  const handleComplete = async (answers: ExtractedAnswer[]) => {
    console.log("Form completed! Submitting...");
    
    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          pageUrl: window.location.href,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log("✅ Success! Redirecting to results...");
        
        // Get user email from answers
        const email = answers.find(a => a.questionId === 'email')?.value as string;
        
        // Redirect to results page with data in URL params
        const params = new URLSearchParams({
          analysis: encodeURIComponent(JSON.stringify(data.analysis)),
          comparableHomes: encodeURIComponent(JSON.stringify(data.comparableHomes)),
          email: encodeURIComponent(email || ''),
        });
        
        // Reset chat store for next user
        reset();
        
        router.push(`/results?${params.toString()}`);
      } else {
        alert('Something went wrong. Please try again.');
        console.error('Submission failed:', data.error);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert('Error submitting form. Please try again.');
    }
  };

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
        <ChatWithTracker onComplete={handleComplete} />
      </div>
    </main>
  );
}