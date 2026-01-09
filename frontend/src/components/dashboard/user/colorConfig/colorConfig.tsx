'use client';

import { useState, useEffect } from 'react';
import { useUserConfig } from '@/contexts/UserConfigContext';
import { PRESET_THEMES, DARK_THEMES, TRADITIONAL_THEMES, DEFAULT_THEME, type ColorTheme } from '@/lib/colors/defaultTheme';
import { injectColorTheme } from '@/lib/colors/colorUtils';
import { determineTextColor, determineTextColorForGradient } from '@/lib/colors/contrastUtils';
import { MessageSquare, Check, Loader2, Save, AlertCircle, Palette, Sparkles } from 'lucide-react';

export default function ColorConfig() {
  const { config, loading: configLoading, refetch } = useUserConfig();
  const [selectedTheme, setSelectedTheme] = useState<ColorTheme>(DEFAULT_THEME);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customTheme, setCustomTheme] = useState<ColorTheme>({
    name: 'Custom',
    primary: '#06b6d4',
    secondary: '#3b82f6',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    accent: '#8b5cf6',
    buttonHover: '#0891b2',
    gradientFrom: '#06b6d4',
    gradientTo: '#3b82f6',
  });

  // Initialize with current config's color theme
  useEffect(() => {
    if (config?.colorConfig) {
      const savedTheme = config.colorConfig;
      // Check if it's a custom theme (not in presets)
      const isPreset = PRESET_THEMES.some(t => t.name === savedTheme.name);
      if (!isPreset) {
        setCustomTheme(savedTheme);
        setSelectedTheme(savedTheme);
        setShowCustom(true);
      } else {
        setSelectedTheme(savedTheme);
      }
    } else {
      setSelectedTheme(DEFAULT_THEME);
    }
  }, [config]);

  // Inject theme for preview
  useEffect(() => {
    injectColorTheme(selectedTheme);
  }, [selectedTheme]);

  const handleThemeSelect = (theme: ColorTheme) => {
    setSelectedTheme(theme);
    setShowCustom(false);
    setSaveStatus('idle');
    setErrorMessage(null);
  };

  const handleCustomColorChange = (field: keyof ColorTheme, value: string) => {
    const updated = { ...customTheme, [field]: value };
    // Auto-update gradient colors if primary/secondary changes
    if (field === 'primary') {
      updated.gradientFrom = value;
      updated.buttonHover = value;
    }
    if (field === 'secondary') {
      updated.gradientTo = value;
    }
    setCustomTheme(updated);
    setSelectedTheme(updated);
    setSaveStatus('idle');
    setErrorMessage(null);
  };

  const handleUseCustom = () => {
    setShowCustom(true);
    setSelectedTheme(customTheme);
  };

  const handleSave = async () => {
    if (!config) {
      setErrorMessage('Configuration not found');
      setSaveStatus('error');
      return;
    }

    setSaving(true);
    setSaveStatus('idle');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/user/color-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          colorConfig: selectedTheme,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save color configuration');
      }

      setSaveStatus('success');
      // Refetch config to get updated data
      await refetch();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save color configuration');
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  if (configLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-300">Configuration not found</p>
            <p className="text-red-400/70 mt-2 text-sm">Please complete onboarding first</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-cyan-50 mb-2">Color Configuration</h1>
          <p className="text-slate-400">
            Customize your bot's color theme. Changes will be applied to your public bot.
          </p>
        </div>

        {/* Save Status Messages */}
        {saveStatus === 'success' && (
          <div className="mb-6 bg-green-900/20 border border-green-500/30 rounded-lg p-4 flex items-center gap-3">
            <Check className="h-5 w-5 text-green-400" />
            <p className="text-green-300">Color configuration saved successfully!</p>
          </div>
        )}

        {saveStatus === 'error' && errorMessage && (
          <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-red-300">{errorMessage}</p>
          </div>
        )}

        {/* Theme Presets */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-cyan-100">Color Themes</h3>
            <button
              onClick={handleUseCustom}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                ${showCustom
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }
              `}
            >
              <Palette className="h-4 w-4" />
              <span>Custom Colors</span>
            </button>
          </div>

          {/* Traditional High-Contrast Themes */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Traditional (High Contrast)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {TRADITIONAL_THEMES.map((theme) => {
                const isSelected = !showCustom && selectedTheme.name === theme.name;
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
                      background: theme.background,
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

          {/* Dark Themes */}
          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-3">Dark Themes</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {DARK_THEMES.map((theme) => {
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
        </div>

        {/* Custom Color Picker */}
        {showCustom && (
          <div className="mb-8 bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-cyan-100">Custom Colors</h3>
              <button
                onClick={() => setShowCustom(false)}
                className="text-slate-400 hover:text-slate-300 text-sm"
              >
                Use Preset
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary Colors */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Primary Color
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={customTheme.primary}
                      onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                      className="w-16 h-16 rounded-lg border-2 border-slate-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customTheme.primary}
                      onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono text-sm"
                      placeholder="#06b6d4"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Secondary Color
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={customTheme.secondary}
                      onChange={(e) => handleCustomColorChange('secondary', e.target.value)}
                      className="w-16 h-16 rounded-lg border-2 border-slate-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customTheme.secondary}
                      onChange={(e) => handleCustomColorChange('secondary', e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono text-sm"
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Accent Color
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={customTheme.accent}
                      onChange={(e) => handleCustomColorChange('accent', e.target.value)}
                      className="w-16 h-16 rounded-lg border-2 border-slate-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customTheme.accent}
                      onChange={(e) => handleCustomColorChange('accent', e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono text-sm"
                      placeholder="#8b5cf6"
                    />
                  </div>
                </div>
              </div>

              {/* Background Colors */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Background Color
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={customTheme.background}
                      onChange={(e) => handleCustomColorChange('background', e.target.value)}
                      className="w-16 h-16 rounded-lg border-2 border-slate-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customTheme.background}
                      onChange={(e) => handleCustomColorChange('background', e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono text-sm"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Surface Color (Cards)
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={customTheme.surface}
                      onChange={(e) => handleCustomColorChange('surface', e.target.value)}
                      className="w-16 h-16 rounded-lg border-2 border-slate-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customTheme.surface}
                      onChange={(e) => handleCustomColorChange('surface', e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono text-sm"
                      placeholder="#f8fafc"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Text Color
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={customTheme.text}
                      onChange={(e) => handleCustomColorChange('text', e.target.value)}
                      className="w-16 h-16 rounded-lg border-2 border-slate-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customTheme.text}
                      onChange={(e) => handleCustomColorChange('text', e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono text-sm"
                      placeholder="#1e293b"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-slate-900/50 rounded-lg">
              <p className="text-xs text-slate-400">
                💡 Tip: For best contrast, use a light background (#ffffff) with dark text (#1e293b) or a dark background with light text.
              </p>
            </div>
          </div>
        )}

        {/* Live Preview */}
        <div className="mb-8">
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

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button
            onClick={handleSave}
            disabled={saving || (selectedTheme.name === config.colorConfig?.name && !showCustom)}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg
              ${saving || selectedTheme.name === config.colorConfig?.name
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 hover:shadow-cyan-500/50'
              }
            `}
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>
                  {(selectedTheme.name === config.colorConfig?.name && !showCustom)
                    ? 'No Changes' 
                    : 'Save Color Configuration'
                  }
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

