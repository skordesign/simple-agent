import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://simple-agent.fly.dev";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Simple Agent — AI Chat Assistant",
    template: "%s | Simple Agent",
  },
  description:
    "A portfolio AI chat assistant powered by GPT-4o. Ask questions, upload files, and get intelligent answers in real time.",
  keywords: ["AI", "chat", "assistant", "GPT-4o", "portfolio", "file analysis"],
  authors: [{ name: "Phat Huynh" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: appUrl,
    siteName: "Simple Agent",
    title: "Simple Agent — AI Chat Assistant",
    description:
      "A portfolio AI chat assistant powered by GPT-4o. Ask questions, upload files, and get intelligent answers in real time.",
  },
  twitter: {
    card: "summary",
    title: "Simple Agent — AI Chat Assistant",
    description:
      "A portfolio AI chat assistant powered by GPT-4o. Ask questions, upload files, and get intelligent answers in real time.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full">{children}</body>
    </html>
  );
}
