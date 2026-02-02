'use client';

import { UserConfigProvider } from '@/contexts/UserConfigContext';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { DashboardSidebar } from '@/components/dashboard/user/userDashboard/DashboardSidebar';
import ImpersonationBanner from '@/components/dashboard/admin/ImpersonationBanner';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <DashboardSidebar />
      {/* Main content area - margin accounts for fixed sidebar */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserConfigProvider>
      <SidebarProvider>
        <ImpersonationBanner />
        <DashboardContent>{children}</DashboardContent>
      </SidebarProvider>
    </UserConfigProvider>
  );
}

