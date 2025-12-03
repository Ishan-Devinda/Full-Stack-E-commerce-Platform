"use client";

import React, { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useSettings, AVAILABLE_CURRENCIES } from "@/contexts/settingsContext";
import {
  ShoppingCart,
  User,
  Search,
  Sun,
  Moon,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { themeConfig } from "@/lib/theme";
import Link from "next/link";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { language, currency, country, setLanguage, setCurrency, setCountry } =
    useSettings();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const t = themeConfig[theme];

  const searchSuggestions = [
    "iPhone 16 Pro Max",
    "Nike Sneakers",
    "Luxury Bags",
    "Home Decor",
    "Smart Watch",
  ];

  const filteredSuggestions = searchQuery
    ? searchSuggestions.filter((s) =>
      s.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  return (
    <nav
      className={`${t.navbar} ${t.text} sticky top-0 z-50 transition-all duration-300`}
    >
      <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={"/"}>
            <div className="flex items-center cursor-pointer">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500 bg-clip-text text-transparent">
                DEV SHOP
              </h1>
              <ShoppingCart className="ml-1 h-6 w-6 text-orange-500" />
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8 relative">
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${t.textSecondary}`}
              />
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg ${t.input} border ${t.border} focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all`}
              />
            </div>

            {/* Search Suggestions Dropdown */}
            {filteredSuggestions.length > 0 && searchQuery && (
              <div
                className={`absolute top-full left-0 right-0 mt-2 ${t.card} ${t.shadow} rounded-lg overflow-hidden z-50 border ${t.border}`}
              >
                {filteredSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSearchQuery(suggestion)}
                    className={`w-full text-left px-4 py-3 ${t.hover} ${t.text} transition-colors`}
                  >
                    <Search className="inline h-4 w-4 mr-2 opacity-50" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-6">
            {/* Location */}
            <button
              className={`flex items-center space-x-2 ${t.hover} p-2 rounded-lg transition-colors`}
            >
              <MapPin className="h-5 w-5" />
              <div className="text-left hidden lg:block">
                <div className={`text-xs ${t.textSecondary}`}>
                  Delivering to {country}
                </div>
                <div className="text-sm font-semibold">Update Location</div>
              </div>
            </button>

            {/* Country/Currency Display */}

            {/* Cart */}
            <Link href={"/Cart"}>
              {" "}
              <button
                className={`relative ${t.hover} p-2 rounded-lg transition-colors`}
              >
                <ShoppingCart className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                  2
                </span>
                <span className="ml-2 font-semibold hidden lg:inline">
                  Cart
                </span>
              </button>
            </Link>

            {/* Theme & Settings Menu */}
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className={`${t.hover} p-2 rounded-lg transition-colors`}
              >
                {theme === "light" ? (
                  <Sun className="h-6 w-6" />
                ) : (
                  <Moon className="h-6 w-6" />
                )}
              </button>
              {showThemeMenu && (
                <>
                  {/* Backdrop to close menu */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowThemeMenu(false)}
                  />

                  {/* Dropdown Menu */}
                  <div
                    className={`absolute right-0 mt-2 w-64 ${t.card} ${t.shadow} rounded-lg p-2 space-y-1 z-50 border ${t.border}`}
                  >
                    {/* Theme Toggle */}
                    <button
                      onClick={toggleTheme}
                      className={`w-full flex items-center justify-between px-4 py-3 ${t.hover} rounded-lg transition-colors`}
                    >
                      <div className="flex items-center space-x-3">
                        {theme === "light" ? (
                          <Moon className="h-5 w-5" />
                        ) : (
                          <Sun className="h-5 w-5" />
                        )}
                        <span className="font-medium">
                          {theme === "light" ? "Dark Mode" : "Light Mode"}
                        </span>
                      </div>
                      {/* Toggle Switch */}
                      <div
                        className={`w-12 h-6 ${theme === "dark" ? "bg-pink-500" : "bg-gray-300"
                          } rounded-full relative transition-colors`}
                      >
                        <div
                          className={`absolute top-1 ${theme === "dark" ? "right-1" : "left-1"
                            } w-4 h-4 bg-white rounded-full transition-all`}
                        />
                      </div>
                    </button>

                    {/* Currency Selector */}
                  </div>
                </>
              )}
              11
            </div>

            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={` ${t.bg} ${t.text} border-none outline-none text-sm font-semibold cursor-pointer`}
            >
              {AVAILABLE_CURRENCIES.map((cur) => (
                <option key={cur} value={cur} className={`${t.text}`}>
                  {cur}
                </option>
              ))}
            </select>

            {/* Sign In Button */}
            <Link href={"/auth/login"}>
              <button
                className={`flex items-center space-x-2 ${t.hover} px-4 py-2 rounded-lg transition-colors`}
              >
                <User className="h-5 w-5" />
                <span className="font-semibold hidden lg:inline">Sign In</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
