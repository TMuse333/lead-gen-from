'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ImpersonationBanner() {
  const [impersonating, setImpersonating] = useState<{
    targetBusinessName: string;
    adminEmail: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkImpersonation();
  }, []);

  const checkImpersonation = async () => {
    try {
      const res = await fetch('/api/admin/impersonate/status');
      if (res.ok) {
        const data = await res.json();
        if (data.isImpersonating) {
          setImpersonating({
            targetBusinessName: data.targetBusinessName,
            adminEmail: data.adminEmail,
          });
        }
      }
    } catch (error) {
      // Silently fail if endpoint doesn't exist yet
    }
  };

  const handleStopImpersonation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/impersonate', {
        method: 'DELETE',
      });

      if (res.ok) {
        const data = await res.json();
        router.push(data.redirectTo || '/admin/dashboard');
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to stop impersonation:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!impersonating) {
    return null;
  }

  return (
    <>
    {/* Spacer to push content down */}
    <div className="h-[60px]" />
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-6 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5" />
          <div>
            <p className="font-semibold">
              Admin Mode: Viewing as {impersonating.targetBusinessName}
            </p>
            <p className="text-xs text-white/80">
              Logged in as admin ({impersonating.adminEmail})
            </p>
          </div>
        </div>

        <button
          onClick={handleStopImpersonation}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut className="h-4 w-4" />
          {loading ? 'Exiting...' : 'Exit to Admin Dashboard'}
        </button>
      </div>
    </div>
    </>
  );
}
