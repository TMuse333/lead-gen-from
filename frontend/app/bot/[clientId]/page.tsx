// app/bot/[clientId]/page.tsx
// Public bot page for each client

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ChatWithTracker from '@/components/ux/chatWithTracker/chatWithTracker';
import { Loader2, AlertCircle } from 'lucide-react';
import { injectColorTheme, getTheme } from '@/lib/colors/colorUtils';

interface ClientConfig {
  id: string;
  businessName: string;
  industry: string;
  dataCollection: string[];
  selectedIntentions: string[];
  selectedOffers: string[];
  customOffer?: string;
  conversationFlows: Record<string, any>;
  colorConfig?: any; // ColorTheme
  qdrantCollectionName: string;
  isActive: boolean;
  onboardingCompletedAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function BotPage() {
  const params = useParams();
  const clientId = params.clientId as string;
  
  const [config, setConfig] = useState<ClientConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) {
      setError('Client ID is required');
      setLoading(false);
      return;
    }

    const fetchConfig = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/client/${clientId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError(`Bot configuration not found for "${clientId}"`);
          } else {
            throw new Error('Failed to fetch configuration');
          }
          return;
        }

        const data = await response.json();
        if (data.success && data.config) {
          setConfig(data.config);
          // Inject color theme CSS variables
          const theme = getTheme(data.config.colorConfig);
          injectColorTheme(theme);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching client config:', err);
        setError(err instanceof Error ? err.message : 'Failed to load bot configuration');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [clientId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1525] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-cyan-400">
          <Loader2 className="w-12 h-12 animate-spin" />
          <p className="text-lg font-medium">Loading bot configuration...</p>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen bg-[#0a1525] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-slate-900/50 border border-red-500/30 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-300 mb-2">Bot Not Found</h1>
          <p className="text-red-400/70 mb-4">
            {error || 'Configuration not found'}
          </p>
          <p className="text-slate-400 text-sm">
            Please check the URL or contact support if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  return <ChatWithTracker clientConfig={config} />;
}

