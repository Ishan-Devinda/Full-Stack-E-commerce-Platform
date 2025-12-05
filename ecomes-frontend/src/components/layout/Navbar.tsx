"use client";

import React, { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useSettings, AVAILABLE_CURRENCIES, COUNTRY_FLAGS } from "@/contexts/settingsContext";
import { useAuth } from "@/hooks/useAuth";
import { useSearch } from "@/contexts/SearchContext";
import { useRouter, usePathname } from "next/navigation";
import {
  ShoppingCart,
  User,
  Search,
  Sun,
  Moon,
  MapPin,
  ChevronDown,
  LogOut,
  UserCircle,
  Menu,
  X,
} from "lucide-react";
import { themeConfig } from "@/lib/theme";
import Link from "next/link";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { currency, setCurrency, country, countryName } = useSettings();
  const { user } = useAuth();
  const { searchInput, setSearchInput } = useSearch();
  const router = useRouter();
  const pathname = usePathname();

  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const t = themeConfig[theme];

  // Check if we're on the main page or search page
  const isMainPage = pathname === "/";
  const isSearchPage = pathname === "/search";
  const isSearchEnabled = isMainPage || isSearchPage;

  const handleSearch = () => {
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput)}`);
      setShowMobileMenu(false);
    }
  };

  const countryFlag = COUNTRY_FLAGS[country] || "🌍";

  return (
    <nav className={`${t.navbar} ${t.text} sticky top-0 z-50 transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={"/"}>
            <div className="flex items-center cursor-pointer">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500 bg-clip-text text-transparent">
                DEV SHOP
              </h1>
              <ShoppingCart className="ml-1 h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8 relative">
            <div className="relative flex items-center w-full">
              <input
                type="text"
                placeholder={isSearchEnabled ? "Search for products..." : "Search (available on home page)"}
                value={searchInput}
                onChange={(e) => {
                  if (isSearchEnabled) {
                    setSearchInput(e.target.value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchInput.trim()) {
                    handleSearch();
                  }
                }}
                disabled={!isSearchEnabled}
                className={`w-full pl-10 pr-12 py-2 rounded-lg ${t.input} border ${t.border} focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all ${!isSearchEnabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              />
              <Search className={`absolute left-3 h-5 w-5 ${t.textSecondary}`} />
              {isSearchEnabled && (
                <button
                  onClick={handleSearch}
                  className="absolute right-2 p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  disabled={!searchInput.trim()}
                >
                  <Search className={`h-5 w-5 ${searchInput.trim() ? "text-blue-500" : t.textSecondary}`} />
                </button>
              )}
            </div>
          </div>

          {/* Desktop Right Side Icons */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Location */}
            <button className={`flex items-center space-x-2 ${t.hover} px-3 py-2 rounded-lg transition-colors`}>
              <span className="text-2xl">{countryFlag}</span>
              <div className="text-left">
                <div className={`text-xs ${t.textSecondary}`}>Deliver to</div>
                <div className="text-sm font-semibold">{countryName}</div>
              </div>
            </button>

            {/* Cart */}
            <Link href={"/Cart"}>
              <button className={`relative ${t.hover} p-2 rounded-lg transition-colors`}>
                <ShoppingCart className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                  2
                </span>
              </button>
            </Link>

            {/* Theme Toggle */}
            <button onClick={toggleTheme} className={`${t.hover} p-2 rounded-lg transition-colors`}>
              {theme === "light" ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
            </button>

            {/* Currency Selector */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={`${t.bg} ${t.text} border ${t.border} rounded-lg px-3 py-2 text-sm font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-500`}
            >
              {AVAILABLE_CURRENCIES.map((cur) => (
                <option key={cur} value={cur}>
                  {cur}
                </option>
              ))}
            </select>

            {/* User Profile */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className={`flex items-center space-x-2 ${t.hover} px-4 py-2 rounded-lg transition-colors`}
                >
                  <User className="h-5 w-5" />
                  <span className="font-semibold">{user.username || "Account"}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                    <div className={`absolute right-0 mt-2 w-56 ${t.card} ${t.shadow} rounded-lg p-2 space-y-1 z-50 border ${t.border}`}>
                      <Link href="/profile">
                        <button
                          onClick={() => setShowProfileMenu(false)}
                          className={`w-full flex items-center space-x-3 px-4 py-3 ${t.hover} rounded-lg transition-colors`}
                        >
                          <UserCircle className="h-5 w-5" />
                          <span className="font-medium">My Profile</span>
                        </button>
                      </Link>
                      <div className={`border-t ${t.border} my-1`} />
                      <button
                        onClick={() => {
                          localStorage.removeItem("token");
                          setShowProfileMenu(false);
                          router.push("/");
                          window.location.reload();
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 ${t.hover} rounded-lg transition-colors text-red-500`}
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href={"/auth/login"}>
                <button className={`flex items-center space-x-2 ${t.hover} px-4 py-2 rounded-lg transition-colors`}>
                  <User className="h-5 w-5" />
                  <span className="font-semibold">Sign In</span>
                </button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden py-4 space-y-4 border-t border-gray-200 dark:border-gray-700">
            {/* Mobile Search */}
            {isSearchEnabled && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchInput.trim()) {
                      handleSearch();
                    }
                  }}
                  className={`w-full pl-10 pr-12 py-2 rounded-lg ${t.input} border ${t.border} focus:outline-none focus:ring-2 focus:ring-pink-500`}
                />
                <Search className={`absolute left-3 top-2.5 h-5 w-5 ${t.textSecondary}`} />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1.5 p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                  disabled={!searchInput.trim()}
                >
                  <Search className={`h-5 w-5 ${searchInput.trim() ? "text-blue-500" : t.textSecondary}`} />
                </button>
              </div>
            )}

            {/* Mobile Location */}
            <div className={`flex items-center space-x-3 p-3 rounded-lg ${t.card}`}>
              <span className="text-2xl">{countryFlag}</span>
              <div>
                <div className={`text-xs ${t.textSecondary}`}>Deliver to</div>
                <div className="text-sm font-semibold">{countryName}</div>
              </div>
            </div>

            {/* Mobile Cart */}
            <Link href={"/Cart"} onClick={() => setShowMobileMenu(false)}>
              <div className={`flex items-center justify-between p-3 rounded-lg ${t.hover}`}>
                <div className="flex items-center space-x-3">
                  <ShoppingCart className="h-6 w-6" />
                  <span className="font-semibold">Cart</span>
                </div>
                <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-semibold">
                  2
                </span>
              </div>
            </Link>

            {/* Mobile Theme Toggle */}
            <button
              onClick={() => {
                toggleTheme();
                setShowMobileMenu(false);
              }}
              className={`w-full flex items-center justify-between p-3 rounded-lg ${t.hover}`}
            >
              <div className="flex items-center space-x-3">
                {theme === "light" ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
                <span className="font-semibold">{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
              </div>
            </button>

            {/* Mobile Currency */}
            <div className={`p-3 rounded-lg ${t.card}`}>
              <label className={`text-xs ${t.textSecondary} block mb-2`}>Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={`w-full ${t.bg} ${t.text} border ${t.border} rounded-lg px-3 py-2 text-sm font-semibold cursor-pointer`}
              >
                {AVAILABLE_CURRENCIES.map((cur) => (
                  <option key={cur} value={cur}>
                    {cur}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile User */}
            {user ? (
              <div className="space-y-2">
                <Link href="/profile" onClick={() => setShowMobileMenu(false)}>
                  <div className={`flex items-center space-x-3 p-3 rounded-lg ${t.hover}`}>
                    <UserCircle className="h-6 w-6" />
                    <span className="font-semibold">{user.username || "My Profile"}</span>
                  </div>
                </Link>
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    setShowMobileMenu(false);
                    router.push("/");
                    window.location.reload();
                  }}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg ${t.hover} text-red-500`}
                >
                  <LogOut className="h-6 w-6" />
                  <span className="font-semibold">Logout</span>
                </button>
              </div>
            ) : (
              <Link href={"/auth/login"} onClick={() => setShowMobileMenu(false)}>
                <div className={`flex items-center space-x-3 p-3 rounded-lg ${t.hover}`}>
                  <User className="h-6 w-6" />
                  <span className="font-semibold">Sign In</span>
                </div>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
