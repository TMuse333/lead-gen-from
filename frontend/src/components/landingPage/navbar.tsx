"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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

  // Default links, Home is now part of the list
  const defaultLinks: NavItem[] = [
    { destination: "/", name: "Home" },
    { destination: "/feedback", name: "Feedback" },
    { destination: "/dashboard", name: "Admin Dashboard" },
  ];

  const allLinks = links || defaultLinks;

  return (
    <nav className="bg-[#0a1525] text-white px-4 py-2 flex items-center justify-between">
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
                  {/* {isHome && ( */}
                   
                  {/* )} */}
                  <span>{link.name}</span>
 
              </Link>
            );
          })}
      </div>
    </nav>
  );
}
