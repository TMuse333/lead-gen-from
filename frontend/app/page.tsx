// app/page.tsx (or wherever your Home component lives)

import FormPage from "@/components/pageComponents/frontendPages/formPage/formPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Real Estate Chatbot Builder | FocusFlow Neural Engine",
  description:
    "Launch your own hyper-personalized AI real estate chatbot in minutes. Converts visitors 24/7, remembers every lead, qualifies instantly — trained on your expertise. No code needed.",
  keywords:
    "AI real estate chatbot, realtor AI agent, real estate lead generation bot, personalized real estate AI, neural engine chatbot, real estate AI 2026, FocusFlow Neural Engine",
  
  openGraph: {
    title: "FocusFlow Neural Engine – Your AI Real Estate Agent That Never Sleeps",
    description:
      "The first real estate chatbot that thinks, speaks, and converts like YOU. Built with next-gen neural memory, gamified flows, and instant personalization.",
    url: "https://chatbot.focusflowsoftware.com",
    siteName: "FocusFlow Neural Engine",
    images: [
      {
        url: "https://www.focusflowsoftware.com/media/focusFlow-logo.png",
        width: 1200,
        height: 630,
        alt: "FocusFlow Neural Engine – AI Real Estate Chatbot That Converts Like You",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Your Personal AI Real Estate Agent Is Here",
    description: "Never miss a lead again. Your AI clone works 24/7, remembers everything, and closes deals while you sleep.",
    images: ["https://www.focusflowsoftware.com/media/focusFlow-logo.png"],
  },

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: ["/favicon.ico?v=4"],
    shortcut: ["/favicon.ico?v=4"],
    apple: ["/favicon.ico?v=4"],
  },
};

export default function Home() {
  return <FormPage />;
}