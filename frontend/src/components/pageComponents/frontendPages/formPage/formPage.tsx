// app/form/page.tsx
"use client";

import { useEffect } from 'react';
import Navbar from '@/components/landingPage/navbar';
import NeuralShowcase from '@/components/landingPage/NeuralShowcase';
import { DEFAULT_THEME } from '@/lib/colors/defaultTheme';
import { injectColorTheme } from '@/lib/colors/colorUtils';

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
    <main className="min-h-screen bg-[#0a0f1a] relative">
      <Navbar/>
      <div className="pt-14">
        <NeuralShowcase />
      </div>
    </main>
  );
}
