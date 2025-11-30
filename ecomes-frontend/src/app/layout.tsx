import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ConfigProvider } from "antd";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SettingsProvider } from "@/contexts/settingsContext";
import GlobalBackground from "@/contexts/BackgroundGradient";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Emox - E-commerce Platform",
  description:
    "Complete e-commerce platform with authentication and theme support",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} relative min-h-screen`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <SettingsProvider>
            <ConfigProvider
              theme={{
                token: {
                  colorPrimary: "#f43f5e",
                  borderRadius: 8,
                },
              }}
            >
              <AuthProvider>
                <Navbar />
                {/* 🌈 Background shown below everything */}
                <GlobalBackground />

                {/* All your page content */}
                {children}
              </AuthProvider>
            </ConfigProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
