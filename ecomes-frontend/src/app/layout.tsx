"use client";

import { Inter } from "next/font/google";
import { ConfigProvider } from "antd";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SettingsProvider } from "@/contexts/settingsContext";
import { SearchProvider } from "@/contexts/SearchContext";
import GlobalBackground from "@/contexts/BackgroundGradient";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { usePathname } from "next/navigation";

import ChatbotWidget from "@/components/chatbot/ChatbotWidget";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} relative min-h-screen`}
        suppressHydrationWarning>
        <ThemeProvider>
          <SettingsProvider>
            <SearchProvider>
              <ConfigProvider
                theme={{
                  token: {
                    colorPrimary: "#f43f5e",
                    borderRadius: 8,
                  },
                }}
              >
                <AuthProvider>
                  {/* Hide navbar on admin routes */}
                  {!isAdminRoute && <Navbar />}
                  {!isAdminRoute && <ChatbotWidget />}
                  {/* 🌈 Background shown below everything */}
                  <GlobalBackground />

                  {/* All your page content */}
                  {children}
                </AuthProvider>
              </ConfigProvider>
            </SearchProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
