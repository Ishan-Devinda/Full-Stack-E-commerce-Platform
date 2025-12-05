"use client";

import React, { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useSettings, AVAILABLE_CURRENCIES } from "@/contexts/settingsContext";
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
} from "lucide-react";
import { themeConfig } from "@/lib/theme";
import Link from "next/link";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { language, currency, country, setLanguage, setCurrency, setCountry } =
    useSettings();
  const { user } = useAuth();
  const { searchQuery, searchInput, setSearchInput, triggerSearch } = useSearch();
  const router = useRouter();
  const pathname = usePathname();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const t = themeConfig[theme];

  // Check if we're on the main page or search page
  const isMainPage = pathname === "/";
  const isSearchPage = pathname === "/search";
  const isSearchEnabled = isMainPage || isSearchPage;

  const handleSearch = () => {
    if (searchInput.trim()) {
      // Navigate to search page with query
      router.push(`/search?q=${encodeURIComponent(searchInput)}`);
    }
  };

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

          {/* Search Bar - Works on main page and search page */}
          <div className="flex-1 max-w-2xl mx-8 relative">
            <div className="relative flex items-center">
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
              <Search
                className={`absolute left-3 h-5 w-5 ${t.textSecondary}`}
              />
              {isSearchEnabled && (
                <button
                  onClick={handleSearch}
                  className="absolute right-2 p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  disabled={!searchInput.trim()}
                >
                  <Search className={`h-5 w-5 ${searchInput.trim() ? 'text-blue-500' : t.textSecondary}`} />
                </button>
              )}
            </div>
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

            {/* Cart */}
            <Link href={"/Cart"}>
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
                  </div>
                </>
              )}
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

            {/* User Profile / Sign In */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className={`flex items-center space-x-2 ${t.hover} px-4 py-2 rounded-lg transition-colors`}
                >
                  <User className="h-5 w-5" />
                  <span className="font-semibold hidden lg:inline">
                    {user.username || "Account"}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {showProfileMenu && (
                  <>
                    {/* Backdrop to close menu */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowProfileMenu(false)}
                    />

                    {/* Dropdown Menu */}
                    <div
                      className={`absolute right-0 mt-2 w-56 ${t.card} ${t.shadow} rounded-lg p-2 space-y-1 z-50 border ${t.border}`}
                    >
                      {/* Profile Link */}
                      <Link href="/profile">
                        <button
                          onClick={() => setShowProfileMenu(false)}
                          className={`w-full flex items-center space-x-3 px-4 py-3 ${t.hover} rounded-lg transition-colors`}
                        >
                          <UserCircle className="h-5 w-5" />
                          <span className="font-medium">My Profile</span>
                        </button>
                      </Link>

                      {/* Divider */}
                      <div className={`border-t ${t.border} my-1`} />

                      {/* Logout */}
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
                <button
                  className={`flex items-center space-x-2 ${t.hover} px-4 py-2 rounded-lg transition-colors`}
                >
                  <User className="h-5 w-5" />
                  <span className="font-semibold hidden lg:inline">Sign In</span>
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
