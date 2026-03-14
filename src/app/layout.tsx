import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { VoiceNavigator } from "@/components/VoiceNavigator";
import { TopNavbar } from "@/components/TopNavbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FarmAssist",
  description: "AI Smart Farm Market Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#f4fcf6] min-h-screen text-gray-900`}
      >
        <LanguageProvider>
          <TopNavbar />
          <div className="pt-16 pb-20 max-w-md mx-auto relative min-h-screen">
            {children}
            <VoiceNavigator />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
