// src/app/page.tsx
"use client";

import React, { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useSettings } from "@/contexts/settingsContext";
import { useCategories } from "@/hooks/useCategories";
import { useCategoryUtils } from "@/hooks/useCategoryUtils";
import { useProducts } from "@/hooks/useProducts";
import { themeConfig } from "@/lib/theme";
import {
  ShoppingCart,
  User,
  Search,
  Sun,
  Moon,
  Globe,
  DollarSign,
  MapPin,
  Menu,
  ChevronDown,
  Gift,
  Radio,
  Loader2,
  RefreshCw,
  Filter,
} from "lucide-react";
import { Col, Row, message, Pagination, Select } from "antd";
import ProductCard from "@/components/ProductCard";
import { useRouter } from "next/navigation";
import { log } from "node:console";
// Categories data

const heroSlides = [
  {
    title: "iPhone 16 Pro Max",
    subtitle: "From $ 50,769*",
    description: "A18 chip. Superfast. Supersmart\nHistory. Biggest Price Drop",
    bg: "from-indigo-900 via-blue-900 to-purple-900",
    image: "📱",
  },
  {
    title: "SALE UP TO 50% OFF",
    subtitle: "Summer Collection",
    description: "Premium Sneakers\nLimited Time Offer",
    bg: "from-cyan-500 via-blue-500 to-teal-400",
    image: "👟",
  },
];

const searchSuggestions = [
  "iPhone 16 Pro Max",
  "Nike Sneakers",
  "Luxury Bags",
  "Home Decor",
  "Wireless Headphones",
  "Smart Watch",
  "Running Shoes",
  "Laptop",
];

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  discount?: number;
  inStock: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
}

export default function HomePage() {
  // Use contexts
  const { theme, toggleTheme } = useTheme();
  const { language, currency, country, setLanguage, setCurrency, setCountry } =
    useSettings();

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories();
  const { getCategoryDisplayName, getCategoryEmoji, getCategoryColor } =
    useCategoryUtils();

  // Use product hooks
  const {
    products: productsData,
    loading: productsLoading,
    error: productsError,
    pagination,
    refreshProducts,
  } = useProducts({
    limit: 12,
    page: 1,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const safeProducts = Array.isArray(productsData?.products)
    ? productsData.products
    : [];

  console.log(safeProducts);
  console.log(productsData);

  // Local state
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");

  // Get theme configuration
  const t = themeConfig[theme];

  // Filter search suggestions
  const filteredSuggestions = searchQuery
    ? searchSuggestions.filter((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const router = useRouter();
  const popularCategories = categories.map((category) => ({
    name: getCategoryDisplayName(category._id),
    image: getCategoryEmoji(category._id),
    color: getCategoryColor(category._id),
    id: category._id,
    count: category.count,
  }));

  // Find current selections

  const handleAddToCart = (productId: string) => {
    message.success("Product added to cart!");
  };

  const handleAddToWishlist = (productId: string) => {
    message.success("Product added to wishlist!");
  };

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/category/${categoryId}`);
  };

  const handleRetry = () => {
    refreshCategories();
  };
  const handleSortChange = (value: string) => {
    setSortBy(value);
    // You can implement sorting here
  };

  const handlePageChange = (page: number) => {
    // You can implement pagination here
    console.log("Page changed to:", page);
  };

  // Loading state for products
  if (productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  // Error state for products
  if (productsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">
            Error loading products: {productsError}
          </p>
          <button
            onClick={refreshProducts}
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center mx-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }
  return (
    <div
      className={`min-h-screen w-full  ${t.text} transition-all duration-100`}
    >
      {/* Top Navbar */}

      {/* Categories Navigation Bar */}
      <div className={`${t.navbar} transition-all duration-300`}>
        c
        <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-8 h-12 overflow-x-auto">
            {/* All Categories Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setShowCategoryMenu(true)}
                onMouseLeave={() => setShowCategoryMenu(false)}
                className={`flex items-center space-x-2 ${t.hover} px-4 py-2 rounded-lg transition-colors font-semibold whitespace-nowrap`}
              >
                <Menu className="h-5 w-5" />
                <span>All Categories</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {showCategoryMenu && (
                <div
                  onMouseEnter={() => setShowCategoryMenu(true)}
                  onMouseLeave={() => setShowCategoryMenu(false)}
                  className={`absolute top-full left-0 mt-2 w-64 ${t.card} ${t.shadow} rounded-lg p-2 space-y-1 max-h-96 overflow-y-auto z-50 border ${t.border}`}
                >
                  {" "}
                  {categories.map((category) => (
                    <button
                      key={category._id}
                      onClick={() => handleCategoryClick(category._id)}
                      className={`w-full text-left px-4 py-3 ${t.hover} rounded-lg transition-colors ${t.text} flex justify-between items-center`}
                    >
                      <span className="flex items-center">
                        <span className="mr-2 text-lg">
                          {getCategoryEmoji(category._id)}
                        </span>
                        {getCategoryDisplayName(category._id)}
                      </span>
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category Links */}
            {categories.slice(0, 7).map((category) => (
              <button
                key={category._id}
                onClick={() => handleCategoryClick(category._id)}
                className={`${t.textSecondary} hover:text-pink-500 whitespace-nowrap transition-colors font-medium flex items-center`}
              >
                <span className="mr-1">{getCategoryEmoji(category._id)}</span>
                {getCategoryDisplayName(category._id)}
              </button>
            ))}

            {/* Best Deals */}
            <button className="flex items-center space-x-2 text-pink-500 font-semibold whitespace-nowrap">
              <Gift className="h-5 w-5" />
              <span>Best Deals</span>
            </button>

            {/* Live Shopping */}
            <button className="flex items-center space-x-2 text-pink-500 font-semibold whitespace-nowrap">
              <Radio className="h-5 w-5" />
              <span>emox Live</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-350   mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Carousel Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Main Hero Slide */}
          <div className="lg:col-span-2 relative rounded-3xl overflow-hidden h-96">
            <div
              className={`absolute inset-0 bg-gradient-to-r ${heroSlides[currentSlide].bg} p-12 flex items-center justify-between`}
            >
              <div className="text-white max-w-md">
                <h2 className="text-5xl font-bold mb-4">
                  {heroSlides[currentSlide].title}
                </h2>
                <p className="text-3xl font-semibold mb-2">
                  {heroSlides[currentSlide].subtitle}
                </p>
                <p className="text-lg mb-6 whitespace-pre-line opacity-90">
                  {heroSlides[currentSlide].description}
                </p>
                <button className="bg-white text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg">
                  Shop Now
                </button>
                <p className="text-sm mt-4 opacity-70">*Incl. All Offers</p>
              </div>
              <div className="text-9xl hidden md:block">
                {heroSlides[currentSlide].image}
              </div>
            </div>

            {/* Carousel Navigation Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentSlide ? "w-8 bg-white" : "w-2 bg-white/50"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Side Promotional Banner */}
          <div className="rounded-3xl overflow-hidden h-96 bg-gradient-to-br from-cyan-500 via-blue-500 to-teal-400 p-8 flex flex-col items-center justify-center text-white text-center relative shadow-xl">
            <div className="text-9xl mb-4">👟</div>
            <h3 className="text-6xl font-bold mb-2">SALE</h3>
            <p className="text-xl mb-2">UP TO</p>
            <p className="text-7xl font-bold mb-4">50%</p>
            <p className="text-2xl font-semibold">OFF</p>
          </div>
        </div>
        {/* Popular Categories Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-3xl font-bold ${t.text}`}>
              Explore Popular Categories
            </h2>
            {/* <button className="text-blue-500 font-semibold hover:text-blue-600 transition-colors flex items-center">
              View All
              <ChevronDown className="h-5 w-5 ml-1 rotate-[-90deg]" />
            </button> */}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {popularCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`${t.card} ${t.hover} rounded-2xl p-6 flex flex-col items-center justify-center transition-all transform hover:scale-105 ${t.shadow} border ${t.border}`}
              >
                <div
                  className={`text-6xl mb-4 bg-gradient-to-br ${category.color} bg-clip-text`}
                >
                  {category.image}
                </div>
                <p className={`text-sm font-semibold ${t.text} text-center`}>
                  {category.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {category.count} items
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-3xl font-bold ${t.text}`}>
              Today's Best Deals For You!
            </h2>
            {/* <button className="text-blue-500 font-semibold hover:text-blue-600 transition-colors flex items-center">
              View All
              <ChevronDown className="h-5 w-5 ml-1 rotate-[-90deg]" />
            </button> */}
          </div>

          {safeProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Products Found
              </h3>
              <p className="text-gray-600 mb-6">
                We couldn't find any products matching your criteria.
              </p>
              <button
                onClick={refreshProducts}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Refresh Products
              </button>
            </div>
          ) : (
            <>
              <Row gutter={[24, 24]}>
                {safeProducts?.map((product) => (
                  <Col key={product._id} xs={24} sm={12} md={8} lg={6} xl={6}>
                    <ProductCard
                      id={product._id}
                      name={product.name}
                      image={product.images[0] || "/products/placeholder.jpg"}
                      price={product.price}
                      originalPrice={product.originalPrice}
                      rating={product.rating}
                      reviewCount={product.reviewCount}
                      discount={product.discount}
                      inStock={product.inStock}
                      isNew={product.isNew}
                      isBestSeller={product.isBestSeller}
                      currency={currency}
                      onAddToCart={handleAddToCart}
                      onAddToWishlist={handleAddToWishlist}
                    />
                  </Col>
                ))}
              </Row>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <Pagination
                    current={pagination.currentPage}
                    total={pagination.totalProducts}
                    pageSize={pagination.totalPages}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                    className="product-pagination"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer Placeholder */}
      <footer className={`${t.navbar} mt-12 transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className={`${t.textSecondary} text-sm`}>
              © 2025 Emox E-commerce. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
