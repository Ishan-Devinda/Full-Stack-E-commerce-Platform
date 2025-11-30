"use client";

import React from "react";
import { useTheme } from "@/contexts/ThemeContext";

const GlobalBackground = () => {
  const { theme } = useTheme();

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Light mode background */}
      {theme === "light" && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-pink-50 to-rose-100"></div>

          {/* Animated Blobs */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-orange-300 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-300 to-rose-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-br from-rose-300 to-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </>
      )}

      {/* Dark mode background */}
      {theme === "dark" && (
        <>
          {/* Base Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950"></div>

          {/* Glowing Animated Blobs */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-700 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>

          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-600 via-fuchsia-700 to-indigo-800 rounded-full mix-blend-screen filter blur-3xl opacity-25 animate-blob animation-delay-2000"></div>

          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-br from-pink-700 via-purple-800 to-indigo-900 rounded-full mix-blend-screen filter blur-3xl opacity-25 animate-blob animation-delay-4000"></div>

          {/* Optional subtle overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-black/20"></div>
        </>
      )}
    </div>
  );
};

export default GlobalBackground;
