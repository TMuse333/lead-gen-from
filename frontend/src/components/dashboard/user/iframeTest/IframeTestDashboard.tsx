"use client";

import { useState, useEffect } from 'react';
import { Smartphone, Tablet, Monitor, Maximize2, Copy, Check, ExternalLink, Code } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function IframeTestDashboard() {
  const { data: session } = useSession();
  const [iframeSize, setIframeSize] = useState<'mobile' | 'tablet' | 'desktop' | 'custom'>('desktop');
  const [customWidth, setCustomWidth] = useState(800);
  const [customHeight, setCustomHeight] = useState(600);
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [embedMode, setEmbedMode] = useState(true);
  const [clientId, setClientId] = useState<string>('');

  // Fetch user's client ID on mount
  useEffect(() => {
    const fetchClientConfig = async () => {
      if (!session?.user?.email) return;

      try {
        const res = await fetch('/api/user/config');
        if (res.ok) {
          const data = await res.json();
          // Use businessName as the clientId for the bot URL
          if (data.config?.businessName) {
            setClientId(data.config.businessName);
          }
        }
      } catch (error) {
        console.error('Failed to fetch client config:', error);
      }
    };
    fetchClientConfig();
  }, [session]);

  // Get iframe dimensions based on selected size
  const getDimensions = () => {
    switch (iframeSize) {
      case 'mobile':
        return { width: 375, height: 667 };
      case 'tablet':
        return { width: 768, height: 1024 };
      case 'desktop':
        return { width: 1200, height: 800 };
      case 'custom':
        return { width: customWidth, height: customHeight };
    }
  };

  const dimensions = getDimensions();
  const iframeUrl = clientId
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/bot/${clientId}${embedMode ? '?embed=true' : ''}`
    : '';

  // Generate embed code
  const embedCode = `<!-- AI Chatbot Embed Code -->
<iframe
  src="${iframeUrl}"
  width="100%"
  height="600px"
  style="border: none; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
  allow="microphone"
  title="AI Chat Assistant"
></iframe>`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!clientId) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-slate-400">Loading your bot configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-md rounded-lg border border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Code className="text-cyan-400" size={24} />
            <h2 className="text-2xl font-bold text-white">Test Your Bot in Iframe</h2>
          </div>
          <p className="text-slate-400">
            Preview how your chatbot will look when embedded on your website and get the embed code.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-slate-800/50 backdrop-blur-md rounded-lg border border-slate-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Embed Mode Toggle */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Display Mode
              </label>
              <button
                onClick={() => setEmbedMode(!embedMode)}
                className={`w-full px-4 py-2 rounded-lg border transition-all flex items-center justify-between ${
                  embedMode
                    ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200'
                    : 'bg-slate-700/50 border-slate-600 text-slate-300'
                }`}
              >
                <span className="font-medium">{embedMode ? 'Embed Mode' : 'Standalone Mode'}</span>
                <div className={`w-12 h-6 rounded-full relative transition-colors ${embedMode ? 'bg-cyan-500' : 'bg-slate-600'}`}>
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      embedMode ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </div>
              </button>
              <p className="text-xs text-slate-500 mt-1">
                {embedMode ? 'Compact layout for iframe embedding' : 'Full layout with side panel'}
              </p>
            </div>

            {/* Size Presets */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Screen Size
              </label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => setIframeSize('mobile')}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg transition ${
                    iframeSize === 'mobile'
                      ? 'bg-cyan-500/30 border-2 border-cyan-400'
                      : 'bg-slate-700/50 border border-slate-600 hover:bg-slate-700'
                  }`}
                >
                  <Smartphone size={20} className="text-cyan-400" />
                  <span className="text-xs text-slate-300">Mobile</span>
                </button>
                <button
                  onClick={() => setIframeSize('tablet')}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg transition ${
                    iframeSize === 'tablet'
                      ? 'bg-cyan-500/30 border-2 border-cyan-400'
                      : 'bg-slate-700/50 border border-slate-600 hover:bg-slate-700'
                  }`}
                >
                  <Tablet size={20} className="text-cyan-400" />
                  <span className="text-xs text-slate-300">Tablet</span>
                </button>
                <button
                  onClick={() => setIframeSize('desktop')}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg transition ${
                    iframeSize === 'desktop'
                      ? 'bg-cyan-500/30 border-2 border-cyan-400'
                      : 'bg-slate-700/50 border border-slate-600 hover:bg-slate-700'
                  }`}
                >
                  <Monitor size={20} className="text-cyan-400" />
                  <span className="text-xs text-slate-300">Desktop</span>
                </button>
                <button
                  onClick={() => setIframeSize('custom')}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg transition ${
                    iframeSize === 'custom'
                      ? 'bg-cyan-500/30 border-2 border-cyan-400'
                      : 'bg-slate-700/50 border border-slate-600 hover:bg-slate-700'
                  }`}
                >
                  <Maximize2 size={20} className="text-cyan-400" />
                  <span className="text-xs text-slate-300">Custom</span>
                </button>
              </div>
            </div>

            {/* Custom Dimensions */}
            {iframeSize === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Width (px)
                  </label>
                  <input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    min={320}
                    max={1920}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Height (px)
                  </label>
                  <input
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    min={400}
                    max={1200}
                  />
                </div>
              </>
            )}
          </div>

          {/* Current Settings Display */}
          <div className="mt-4 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Preview Dimensions:</span>
              <span className="text-sm font-mono text-cyan-300">{dimensions.width}px × {dimensions.height}px</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Mode:</span>
              <span className="text-sm font-medium text-cyan-300">{embedMode ? 'Embed (Compact)' : 'Standalone (Full)'}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setShowCode(!showCode)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 rounded-lg text-cyan-200 transition-all"
            >
              <Code size={18} />
              {showCode ? 'Hide' : 'Show'} Embed Code
            </button>
            <button
              onClick={copyEmbedCode}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 rounded-lg text-cyan-200 transition-all"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copied!' : 'Copy Embed Code'}
            </button>
            <a
              href={iframeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 rounded-lg text-cyan-200 transition-all"
            >
              <ExternalLink size={18} />
              Open in New Tab
            </a>
          </div>

          {/* Embed Code Display */}
          {showCode && (
            <div className="mt-4">
              <div className="bg-slate-900/70 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-cyan-400 uppercase tracking-wide">HTML Embed Code</span>
                  <button
                    onClick={copyEmbedCode}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="text-sm text-cyan-200/90 overflow-x-auto">
                  <code>{embedCode}</code>
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="bg-slate-800/50 backdrop-blur-md rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Live Preview</h3>

          {/* Preview Container with Device Frame */}
          <div className="flex items-center justify-center p-8 bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-lg min-h-[600px]">
            <div
              className="bg-slate-950 rounded-xl shadow-2xl overflow-hidden border-4 border-slate-700"
              style={{
                width: `${dimensions.width}px`,
                height: `${dimensions.height}px`,
                maxWidth: '100%'
              }}
            >
              <iframe
                key={`${clientId}-${iframeSize}-${customWidth}-${customHeight}-${embedMode}`}
                src={iframeUrl}
                className="w-full h-full"
                title="Chatbot Preview"
                allow="microphone"
              />
            </div>
          </div>
        </div>

        {/* Integration Tips */}
        <div className="bg-slate-800/50 backdrop-blur-md rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Integration Tips</h3>
          <div className="space-y-3 text-slate-400 text-sm">
            <div className="flex gap-3">
              <span className="text-cyan-400 font-bold">1.</span>
              <p><strong className="text-slate-300">Responsive Design:</strong> The chatbot automatically adapts to the iframe size. Use <code className="px-2 py-0.5 bg-slate-900/50 rounded text-cyan-300">width="100%"</code> for full-width embedding.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-cyan-400 font-bold">2.</span>
              <p><strong className="text-slate-300">Minimum Height:</strong> We recommend a minimum height of 500px for optimal user experience.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-cyan-400 font-bold">3.</span>
              <p><strong className="text-slate-300">Styling:</strong> Add <code className="px-2 py-0.5 bg-slate-900/50 rounded text-cyan-300">border-radius</code> and <code className="px-2 py-0.5 bg-slate-900/50 rounded text-cyan-300">box-shadow</code> for a polished look.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-cyan-400 font-bold">4.</span>
              <p><strong className="text-slate-300">Color Theming:</strong> The chatbot uses your custom color configuration automatically when embedded.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
