"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LogIn, LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";
import logo from "../../../public/logo.png";

type NavItem = {
  destination: string;
  name: string;
};

type NavbarProps = {
  links?: NavItem[];
};

export default function Navbar({ links }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  // Default links, Home is now part of the list
  const defaultLinks: NavItem[] = [
    { destination: "/", name: "Home" },
    { destination: "/feedback", name: "Feedback" },
  ];

  const allLinks = links || defaultLinks;

  const handleLogin = () => {
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

  return (
    <nav className="bg-[#0a1525] w-screen fixed z-[1]  top-0 left-0 text-white px-4 py-2 flex items-center justify-between">
      <div className="flex items-center space-x-4">
      <Image
                      src={logo}
                      alt="Logo"
                      width={30}
                      height={30}
                      className="inline-block"
                    />
        {allLinks
          .filter((link) => link.destination !== pathname)
          .map((link) => {
            const isHome = link.destination === "/";

            return (
              <Link key={link.destination} href={link.destination}
              
                  className={`flex sm:text-lg font-semibold md:text-xl items-center space-x-1  hover:underline transition-opacity ${
                    isHome
                      ? "hover:text-[#00bfff] font-medium"
                      : "text-[#00bfff] opacity-70 hover:opacity-100"
                  }`}
                >
                  <span>{link.name}</span>
 
              </Link>
            );
          })}
      </div>
      
      {/* Auth Section */}
      <div className="flex items-center gap-3">
        {status === 'loading' ? (
          <div className="h-8 w-8 animate-pulse bg-cyan-500/20 rounded"></div>
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
            onClick={handleLogin}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all text-white text-sm font-medium shadow-lg"
          >
            <LogIn className="h-4 w-4" />
            <span>Login</span>
          </button>
        )}
      </div>
    </nav>
  );
}
