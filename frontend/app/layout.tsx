"use client"

import { migrateExistingFlows } from "@/lib/convert/migrateConversationFlows";
import { useConversationConfigStore } from "@/stores/conversationConfigStore";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { useEffect } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  useEffect(() => {
    const flows = useConversationConfigStore.getState().flows;
    if (flows.sell.questions.length === 0) {
      console.log('🔄 Running migration...');
      migrateExistingFlows();
    }
  }, []);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
