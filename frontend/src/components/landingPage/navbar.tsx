"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LogOut, User, Sparkles } from "lucide-react";
import { useState } from "react";
import logo from "../../../public/logo.png";

type SectionItem = {
  id: string;
  name: string;
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const isHomePage = pathname === "/" || pathname === "/form";

  // Section links for smooth scrolling on home page
  const sections: SectionItem[] = [
    { id: "capture", name: "Lead Capture" },
    { id: "timeline", name: "Timeline" },
    { id: "stories", name: "Stories" },
    { id: "learn", name: "Improve" },
  ];

  const handleGetStarted = () => {
    router.push('/auth/signin');
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleDashboard = () => {
    router.push('/dashboard');
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="bg-[#0a1525]/95 backdrop-blur-sm w-screen fixed z-50 top-0 left-0 text-white px-4 py-3 flex items-center justify-between border-b border-white/5">
      <div className="flex items-center gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image
            src={logo}
            alt="Logo"
            width={32}
            height={32}
            className="inline-block"
          />
          <span className="font-bold text-lg hidden sm:inline bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            TimelineAI
          </span>
        </Link>

        {/* Section Navigation - Only show on home page */}
        {isHomePage && (
          <div className="hidden md:flex items-center gap-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="px-3 py-1.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                {section.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Auth Section */}
      <div className="flex items-center gap-3">
        {status === 'loading' ? (
          <div className="h-10 w-24 animate-pulse bg-cyan-500/20 rounded-lg"></div>
        ) : session ? (
          <>
            <button
              onClick={handleDashboard}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 transition-all text-cyan-200 text-sm font-medium"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 transition-all text-red-200 text-sm font-medium disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        ) : (
          <button
            onClick={handleGetStarted}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all text-white font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105"
          >
            <Sparkles className="h-4 w-4 group-hover:animate-pulse" />
            <span>Get Started Free</span>
          </button>
        )}
      </div>
    </nav>
  );
}
