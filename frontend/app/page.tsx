// app/page.tsx (or wherever your Home component lives)

import FormPage from "@/components/pageComponents/frontendPages/formPage/formPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Try the First Real Estate Neural Engine Chatbot | FocusFlow",
  description:
    "Experience the next evolution of real estate AI. Get a sample of the first Neural Engine–powered chatbot that learns your style, speaks like you, and engages leads instantly.",
  keywords:
    "real estate AI sample, AI chatbot demo, realtor chatbot preview, neural engine real estate, FocusFlow chatbot sample, real estate AI 2026",

  openGraph: {
    title: "Get a Sample of the First Neural Engine Chatbot for Realtors",
    description:
      "Preview a new era of real estate automation. Test-drive the AI chatbot that adapts to your voice, qualifies leads automatically, and builds real relationships with prospects.",
    url: "https://chatbot.focusflowsoftware.com",
    siteName: "FocusFlow Neural Engine",
    images: [
      {
        url: "https://www.focusflowsoftware.com/media/focusFlow-logo.png",
        width: 1200,
        height: 630,
        alt: "FocusFlow Neural Engine – Real Estate AI Chatbot Sample",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Try the First Neural Engine Real Estate Chatbot",
    description:
      "Get a hands-on sample of the first AI chatbot built to think and respond like YOU. Experience personalized real estate automation today.",
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