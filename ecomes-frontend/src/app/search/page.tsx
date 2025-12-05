"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { themeConfig } from "@/lib/theme";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import { Loader2, SlidersHorizontal, X } from "lucide-react";
import { Pagination, Slider, Rate, Select } from "antd";

export default function SearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";
    const { theme } = useTheme();
    const t = themeConfig[theme];

    // Filter states
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
    const [minRating, setMinRating] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(true);

    // Fetch products with filters
    const {
        products: productsData,
        loading,
        error,
        pagination,
    } = useProducts({
        search: query,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        minRating: minRating,
        category: selectedCategory || undefined,
        sortBy: sortBy,
        sortOrder: sortOrder,
        page: currentPage,
        limit: 12,
    });

    const products = Array.isArray(productsData?.products)
        ? productsData.products
        : [];

    const handleClearFilters = () => {
        setPriceRange([0, 1000]);
        setMinRating(0);
        setSelectedCategory("");
        setSortBy("createdAt");
        setSortOrder("desc");
    };

    return (
        <div className="min-h-screen py-8 relative">
            <div className="max-w-7xl mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="mb-6">
                    <h1 className={`text-3xl font-bold ${t.text}`}>
                        Search Results {query && `for "${query}"`}
                    </h1>
                    <p className={`${t.textSecondary} mt-2`}>
                        {loading ? "Searching..." : `${pagination?.totalProducts || 0} products found`}
                    </p>
                </div>

                <div className="flex gap-6">
                    {/* Left Sidebar - Filters */}
                    <div
                        className={`${showFilters ? "w-64" : "w-0"} transition-all duration-300 overflow-hidden`}
                    >
                        <div className={`${t.card} rounded-lg p-6 ${t.shadow} sticky top-20`}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className={`text-lg font-semibold ${t.text}`}>Filters</h2>
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="lg:hidden"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Price Range Filter */}
                            <div className="mb-6">
                                <h3 className={`text-sm font-semibold ${t.text} mb-3`}>
                                    Price Range
                                </h3>
                                <Slider
                                    range
                                    min={0}
                                    max={1000}
                                    value={priceRange}
                                    onChange={(value) => setPriceRange(value as [number, number])}
                                    className="mb-2"
                                />
                                <div className="flex justify-between text-sm">
                                    <span className={t.textSecondary}>${priceRange[0]}</span>
                                    <span className={t.textSecondary}>${priceRange[1]}</span>
                                </div>
                            </div>

                            {/* Rating Filter */}
                            <div className="mb-6">
                                <h3 className={`text-sm font-semibold ${t.text} mb-3`}>
                                    Minimum Rating
                                </h3>
                                <Rate
                                    value={minRating}
                                    onChange={setMinRating}
                                    className="text-sm"
                                />
                            </div>

                            {/* Category Filter */}
                            <div className="mb-6">
                                <h3 className={`text-sm font-semibold ${t.text} mb-3`}>
                                    Category
                                </h3>
                                <Select
                                    value={selectedCategory}
                                    onChange={setSelectedCategory}
                                    className="w-full"
                                    placeholder="All Categories"
                                    options={[
                                        { value: "", label: "All Categories" },
                                        { value: "electronics", label: "Electronics" },
                                        { value: "clothing", label: "Clothing" },
                                        { value: "home", label: "Home & Garden" },
                                        { value: "sports", label: "Sports" },
                                    ]}
                                />
                            </div>

                            {/* Clear Filters */}
                            <button
                                onClick={handleClearFilters}
                                className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </div>

                    {/* Main Content - Products */}
                    <div className="flex-1">
                        {/* Sort Options */}
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center space-x-2 ${t.card} px-4 py-2 rounded-lg ${t.shadow}`}
                            >
                                <SlidersHorizontal className="h-5 w-5" />
                                <span>Filters</span>
                            </button>

                            <div className="flex items-center space-x-4">
                                <span className={`text-sm ${t.textSecondary}`}>Sort by:</span>
                                <Select
                                    value={`${sortBy}-${sortOrder}`}
                                    onChange={(value) => {
                                        const [newSortBy, newSortOrder] = value.split("-");
                                        setSortBy(newSortBy);
                                        setSortOrder(newSortOrder as "asc" | "desc");
                                    }}
                                    className="w-48"
                                    options={[
                                        { value: "createdAt-desc", label: "Newest First" },
                                        { value: "createdAt-asc", label: "Oldest First" },
                                        { value: "salePrice-asc", label: "Price: Low to High" },
                                        { value: "salePrice-desc", label: "Price: High to Low" },
                                        { value: "averageRating-desc", label: "Highest Rated" },
                                    ]}
                                />
                            </div>
                        </div>

                        {/* Products Grid */}
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                            </div>
                        ) : products.length === 0 ? (
                            <div className={`${t.card} rounded-lg p-12 text-center`}>
                                <p className={`${t.text} text-lg`}>No products found</p>
                                <p className={`${t.textSecondary} mt-2`}>
                                    Try adjusting your filters or search query
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {products.map((product: any) => (
                                        <ProductCard
                                            key={product._id}
                                            id={product._id}
                                            name={product.name}
                                            image={product.images?.[0] || "/products/placeholder.jpg"}
                                            priceUSD={product.salePrice || product.basePrice}
                                            originalPriceUSD={product.basePrice}
                                            rating={product.averageRating || 0}
                                            reviewCount={product.reviewCount || 0}
                                            discount={product.offers?.discountPercentage}
                                            inStock={product.stock > 0}
                                            isNew={product.isNew}
                                            isBestSeller={product.isBestSeller}
                                        />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {pagination && pagination.totalPages > 1 && (
                                    <div className="flex justify-center mt-8">
                                        <Pagination
                                            current={currentPage}
                                            total={pagination.totalProducts}
                                            pageSize={12}
                                            onChange={setCurrentPage}
                                            showSizeChanger={false}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
