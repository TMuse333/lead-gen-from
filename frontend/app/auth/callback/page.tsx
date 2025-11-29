// app/auth/callback/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Callback page that checks onboarding status and redirects accordingly
 * This is called after successful authentication via magic link
 */
export default function AuthCallbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkOnboardingAndRedirect = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        try {
          const response = await fetch('/api/user/onboarding-status');
          if (response.ok) {
            const data = await response.json();
            if (data.hasCompletedOnboarding) {
              // User has completed onboarding, redirect to dashboard
              router.push('/dashboard');
            } else {
              // User hasn't completed onboarding, redirect to onboarding
              router.push('/onboarding');
            }
          } else {
            // If check fails, default to onboarding
            router.push('/onboarding');
          }
        } catch (error) {
          console.error('Error checking onboarding status:', error);
          // Default to onboarding on error
          router.push('/onboarding');
        } finally {
          setIsChecking(false);
        }
      } else if (status === 'unauthenticated') {
        // Not authenticated, redirect to sign in
        router.push('/auth/signin');
      }
    };

    checkOnboardingAndRedirect();
  }, [status, session, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1525] via-[#0f1b2e] to-[#0a1525]">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mx-auto mb-4" />
        <p className="text-cyan-200">Setting up your account...</p>
      </div>
    </div>
  );
}

