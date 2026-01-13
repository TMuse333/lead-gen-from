"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSession } from "next-auth/react";
import type { EndingCTAConfig } from "@/lib/mongodb/models/clientConfig";

interface UserConfig {
  id: string;
  userId: string;
  // Agent profile
  agentFirstName?: string;
  agentLastName?: string;
  notificationEmail?: string;
  // Business
  businessName: string;
  industry: string;
  dataCollection: string[];
  selectedIntentions: string[];
  selectedOffers: string[];
  customOffer?: string;
  conversationFlows: Record<string, any>;
  colorConfig?: any; // ColorTheme
  knowledgeBaseItems: Array<{
    id: string;
    title: string;
    advice: string;
    flows: string[];
    tags: string[];
    source: string;
  }>;
  qdrantCollectionName: string;
  endingCTA?: EndingCTAConfig;
  isActive: boolean;
  onboardingCompletedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface UserConfigContextType {
  config: UserConfig | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const UserConfigContext = createContext<UserConfigContextType | undefined>(undefined);

export function UserConfigProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [config, setConfig] = useState<UserConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async () => {
    if (status !== "authenticated" || !session?.user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/user/config");
      
      if (!response.ok) {
        if (response.status === 404) {
          // User hasn't completed onboarding yet
          setConfig(null);
          setError("Please complete onboarding first");
        } else {
          throw new Error("Failed to fetch user configuration");
        }
        return;
      }

      const data = await response.json();
      setConfig(data.config);
    } catch (err) {
      console.error("Error fetching user config:", err);
      setError(err instanceof Error ? err.message : "Failed to load configuration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchConfig();
    } else if (status === "unauthenticated") {
      setLoading(false);
      setConfig(null);
    }
  }, [status, session]);

  return (
    <UserConfigContext.Provider value={{ config, loading, error, refetch: fetchConfig }}>
      {children}
    </UserConfigContext.Provider>
  );
}

export function useUserConfig() {
  const context = useContext(UserConfigContext);
  if (context === undefined) {
    throw new Error("useUserConfig must be used within a UserConfigProvider");
  }
  return context;
}

