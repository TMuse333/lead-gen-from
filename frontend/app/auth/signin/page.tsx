"use client";

import { Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { motion } from "framer-motion";

function SignInContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);
  const callbackUrl = searchParams.get("callbackUrl");
  const error = searchParams.get("error");

  // Check onboarding status after successful login
  useEffect(() => {
    const checkOnboardingAndRedirect = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        setCheckingOnboarding(true);
        try {
          const response = await fetch('/api/user/onboarding-status');
          if (response.ok) {
            const data = await response.json();
            if (data.hasCompletedOnboarding) {
              router.push('/dashboard');
            } else {
              router.push('/onboarding');
            }
          } else {
            router.push('/onboarding');
          }
        } catch {
          router.push('/onboarding');
        } finally {
          setCheckingOnboarding(false);
        }
      }
    };

    checkOnboardingAndRedirect();
  }, [status, session, router]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const result = await signIn("email", {
        email,
        redirect: false,
      });

      if (result?.ok) {
        setEmailSent(true);
      } else {
        setIsLoading(false);
      }
    } catch {
      setIsLoading(false);
    }
  };

  if (checkingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1525] via-[#0f1b2e] to-[#0a1525]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-cyan-200">Setting up your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1525] via-[#0f1b2e] to-[#0a1525] px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/20 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent mb-2">
              Get Your Own Bot
            </h1>
            <p className="text-cyan-100/70">
              Sign in to create and customize your AI chatbot
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-lg text-red-200 text-sm">
              {error === "Configuration" && "There was a problem with the server configuration."}
              {error === "AccessDenied" && "Access denied. Please try again."}
              {error === "Verification" && "The verification token has expired or has already been used."}
              {!["Configuration", "AccessDenied", "Verification"].includes(error) && "An error occurred during sign in."}
            </div>
          )}

          {emailSent ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-cyan-500/20 border border-cyan-500/40 rounded-lg text-center"
            >
              <Mail className="h-12 w-12 text-cyan-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-cyan-200 mb-2">
                Check your email!
              </h3>
              <p className="text-cyan-100/80 text-sm mb-4">
                We sent a magic link to <strong>{email}</strong>
              </p>
              <p className="text-cyan-200/60 text-xs">
                Click the link in the email to sign in. The link will expire in 24 hours.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-cyan-200 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-cyan-500/30 text-white placeholder-cyan-200/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                />
              </div>

              <motion.button
                type="submit"
                disabled={isLoading || !email}
                whileHover={{ scale: isLoading || !email ? 1 : 1.02 }}
                whileTap={{ scale: isLoading || !email ? 1 : 0.98 }}
                className="w-full flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4 text-white font-semibold shadow-lg hover:shadow-cyan-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Sending magic link...</span>
                  </>
                ) : (
                  <>
                    <Mail className="h-5 w-5" />
                    <span>Send magic link</span>
                  </>
                )}
              </motion.button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-cyan-200/60">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1525] via-[#0f1b2e] to-[#0a1525]">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
