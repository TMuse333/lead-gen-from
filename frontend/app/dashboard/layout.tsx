'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { UserConfigProvider } from '@/contexts/UserConfigContext';
import { DashboardSidebar } from '@/components/dashboard/user/userDashboard/DashboardSidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  useEffect(() => {
    console.log('🟢 [DashboardLayout] Layout rendering, pathname:', pathname);
  }, [pathname]);
  
  return (
    <UserConfigProvider>
      <div className="min-h-screen bg-slate-900 flex">
        <DashboardSidebar />
        {/* Main content area - margin accounts for fixed sidebar (64 = 256px when open, 20 = 80px when closed) */}
        <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
          {children}
        </div>
      </div>
    </UserConfigProvider>
  );
}

