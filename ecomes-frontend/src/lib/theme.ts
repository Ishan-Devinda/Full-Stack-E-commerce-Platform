// src/lib/theme.ts
export const themeConfig = {
  light: {
    // Backgrounds
    bg: "bg-white",
    bgSecondary: "bg-gray-50",
    bgTertiary: "bg-gray-100",

    // Text
    text: "text-gray-900",
    textSecondary: "text-gray-600",
    textTertiary: "text-gray-500",

    // Borders
    border: "border-gray-200",
    borderSecondary: "border-gray-300",

    // Interactive states
    hover: "hover:bg-gray-50",
    hoverSecondary: "hover:bg-gray-100",
    active: "active:bg-gray-200",

    // Cards & Components
    card: "bg-white",
    cardHover: "hover:bg-gray-50",
    navbar: "bg-white border-b border-gray-200",

    // Inputs
    input: "bg-gray-50 border-gray-300 text-gray-900",
    inputFocus: "focus:border-pink-500 focus:ring-pink-500",
    inputPlaceholder: "placeholder-gray-400",

    // Shadows
    shadow: "shadow-lg",
    shadowMd: "shadow-md",
    shadowSm: "shadow-sm",

    // Overlays
    overlay: "bg-black bg-opacity-50",
    backdropBlur: "backdrop-blur-sm",
  },
  dark: {
    // Backgrounds
    bg: "bg-gray-900",
    bgSecondary: "bg-gray-800",
    bgTertiary: "bg-gray-700",

    // Text
    text: "text-white",
    textSecondary: "text-gray-300",
    textTertiary: "text-gray-400",

    // Borders
    border: "border-gray-700",
    borderSecondary: "border-gray-600",

    // Interactive states
    hover: "hover:bg-gray-800",
    hoverSecondary: "hover:bg-gray-700",
    active: "active:bg-gray-600",

    // Cards & Components
    card: "bg-gray-800",
    cardHover: "hover:bg-gray-700",
    navbar: "bg-gray-900 border-b border-gray-700",

    // Inputs
    input: "bg-gray-800 border-gray-600 text-white",
    inputFocus: "focus:border-pink-500 focus:ring-pink-500",
    inputPlaceholder: "placeholder-gray-500",

    // Shadows
    shadow: "shadow-xl shadow-black/50",
    shadowMd: "shadow-lg shadow-black/30",
    shadowSm: "shadow-md shadow-black/20",

    // Overlays
    overlay: "bg-black bg-opacity-70",
    backdropBlur: "backdrop-blur-sm",
  },
};

export type ThemeConfig = typeof themeConfig.light;

// Helper function to get theme classes
export function getThemeClasses(theme: "light" | "dark") {
  return themeConfig[theme];
}
