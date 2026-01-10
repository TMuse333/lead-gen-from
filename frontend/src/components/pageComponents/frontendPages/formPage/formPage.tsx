// app/form/page.tsx
"use client";

import { useEffect } from 'react';
import AuroraHero from '@/components/landingPage/auroraHero';
import WhyDifferentSection from '@/components/landingPage/whyDifferent';
import TechSpecs from '@/components/landingPage/techSpecs';
import Navbar from '@/components/landingPage/navbar';
import { DEFAULT_THEME } from '@/lib/colors/defaultTheme';
import { injectColorTheme } from '@/lib/colors/colorUtils';

// Chatbot imports - uncomment when re-enabling chatbot on homepage
// import ChatWithTracker from '@/components/ux/chatWithTracker/chatWithTracker';

export default function FormPage() {
  // Scroll to top on page load and inject default theme
  useEffect(() => {
    window.scrollTo(0, 0);

    // Handle hash navigation - prevent auto-scroll if hash exists
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    // Inject default theme for homepage (if no client config)
    const existingTheme = document.getElementById('bot-color-theme');
    if (!existingTheme) {
      injectColorTheme(DEFAULT_THEME);
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#0a1525] relative">
      <Navbar/>
      <AuroraHero/>
      <WhyDifferentSection/>
      <TechSpecs/>

      {/* Chatbot section - hidden for now, will be re-enabled later
      <div className="container mx-auto px-4">
        <ChatWithTracker />
      </div>
      */}
    </main>
  );
}
