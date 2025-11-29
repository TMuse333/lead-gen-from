'use client';

import { useState, useEffect } from 'react';
import { useOnboardingStore } from '@/stores/onboardingStore/onboarding.store';
import { PRESET_THEMES, DEFAULT_THEME, type ColorTheme } from '@/lib/colors/defaultTheme';
import { injectColorTheme } from '@/lib/colors/colorUtils';
import { determineTextColorForGradient } from '@/lib/colors/contrastUtils';
import { MessageSquare, Check } from 'lucide-react';

export default function Step5ColorConfig() {
  const { colorConfig, setColorConfig, setCurrentStep, markStepComplete } = useOnboardingStore();
  const [selectedTheme, setSelectedTheme] = useState<ColorTheme>(colorConfig || DEFAULT_THEME);

  // Inject theme for preview
  useEffect(() => {
    injectColorTheme(selectedTheme);
  }, [selectedTheme]);

  const handleThemeSelect = (theme: ColorTheme) => {
    setSelectedTheme(theme);
    setColorConfig(theme);
  };

  const handleNext = () => {
    setColorConfig(selectedTheme);
    markStepComplete(5);
    setCurrentStep(6);
  };

  const handleBack = () => {
    setCurrentStep(4);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-cyan-50 mb-2">Choose Your Bot Colors</h2>
        <p className="text-slate-300">
          Select a color theme that matches your brand. You'll see a live preview below.
        </p>
      </div>

      {/* Theme Presets */}
      <div>
        <h3 className="text-lg font-semibold text-cyan-100 mb-4">Color Themes</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {PRESET_THEMES.map((theme) => {
            const isSelected = selectedTheme.name === theme.name;
            return (
              <button
                key={theme.name}
                onClick={() => handleThemeSelect(theme)}
                className={`
                  relative p-4 rounded-lg border-2 transition-all
                  ${isSelected 
                    ? 'border-cyan-400 shadow-lg shadow-cyan-500/30' 
                    : 'border-slate-600 hover:border-slate-500'
                  }
                `}
                style={{
                  background: `linear-gradient(135deg, ${theme.background} 0%, ${theme.surface} 100%)`,
                }}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-cyan-400 rounded-full p-1">
                      <Check className="h-4 w-4 text-slate-900" />
                    </div>
                  </div>
                )}
                <div className="text-left">
                  <h4 
                    className="font-semibold mb-2"
                    style={{ color: theme.text }}
                  >
                    {theme.name}
                  </h4>
                  <div className="flex gap-2">
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-white/20"
                      style={{ backgroundColor: theme.primary }}
                    />
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-white/20"
                      style={{ backgroundColor: theme.secondary }}
                    />
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-white/20"
                      style={{ backgroundColor: theme.accent }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Preview */}
      <div>
        <h3 className="text-lg font-semibold text-cyan-100 mb-4">Live Preview</h3>
        <div 
          className="rounded-lg p-6 border-2"
          style={{
            backgroundColor: selectedTheme.background,
            borderColor: selectedTheme.border,
          }}
        >
          {/* Preview Chat Interface */}
          <div className="space-y-4">
            {/* Chat Header */}
            <div 
              className="p-4 rounded-lg"
              style={{ backgroundColor: selectedTheme.surface }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="p-2 rounded-full"
                  style={{ backgroundColor: selectedTheme.primary }}
                >
                  <MessageSquare className="h-5 w-5" style={{ color: selectedTheme.text }} />
                </div>
                <div>
                  <h4 style={{ color: selectedTheme.text }} className="font-semibold">
                    Chat Assistant
                  </h4>
                  <p style={{ color: selectedTheme.textSecondary }} className="text-sm">
                    How can I help you today?
                  </p>
                </div>
              </div>
            </div>

            {/* Sample Message */}
            <div 
              className="p-4 rounded-lg"
              style={{ backgroundColor: selectedTheme.surface }}
            >
              <p style={{ color: selectedTheme.text }} className="mb-3">
                What type of property are you interested in?
              </p>
              <div className="flex flex-wrap gap-2">
                {['Single Family', 'Condo', 'Townhouse'].map((option) => (
                  <button
                    key={option}
                    className="px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${selectedTheme.gradientFrom} 0%, ${selectedTheme.gradientTo} 100%)`,
                      color: determineTextColorForGradient(selectedTheme.gradientFrom, selectedTheme.gradientTo),
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Sample Button */}
            <button
              className="w-full px-6 py-3 rounded-lg font-semibold transition-all"
              style={{
                background: `linear-gradient(135deg, ${selectedTheme.gradientFrom} 0%, ${selectedTheme.gradientTo} 100%)`,
                color: determineTextColorForGradient(selectedTheme.gradientFrom, selectedTheme.gradientTo),
              }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={handleBack}
          className="px-6 py-3 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

