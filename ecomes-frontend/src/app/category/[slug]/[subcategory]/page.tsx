"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Row, Col, Rate, Slider, Checkbox, Radio } from "antd";
import { ChevronRight, SlidersHorizontal, X } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useCategoryData } from "@/hooks/useCategoryData";
import { useProducts } from "@/hooks/useProducts";
import { useProductFilters } from "@/hooks/useProductFilters";

export default function SubCategoryPage({
  params,
}: {
  params: Promise<{ slug: string; subcategory: string }>;
}) {
  const unwrappedParams = React.use(params); // ✅ unwrap the params Promise
  const { slug, subcategory } = unwrappedParams;

  const router = useRouter();

  const [showMobileFilters, setShowMobileFilters] = React.useState(false);

  // ✅ Use unwrapped params here
  const {
    category,
    loading: categoryLoading,
    error: categoryError,
  } = useCategoryData(slug);

  const { filters, updateFilter, setPage, resetFilters } = useProductFilters({
    category: slug,
    subcategory,
    limit: 12,
  });

  const {
    products,
    loading: productsLoading,
    error: productsError,
    pagination,
  } = useProducts(filters);

  const safeProducts = Array.isArray(products?.products)
    ? products.products
    : [];

  const handleAddToCart = (productId: string) => {
    console.log("Add to cart:", productId);
  };

  const handleAddToWishlist = (productId: string) => {
    console.log("Add to wishlist:", productId);
  };

  // Local filter state (for client UI only)
  const handleFilterChange = (key: string, value: any) => {
    updateFilter(key, value);
  };

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  // ============================
  // Filter Sidebar
  // ============================
  const FilterSidebar = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div
      className={`${isMobile
          ? "fixed inset-0 z-50 bg-white overflow-y-auto"
          : "sticky top-4"
        } bg-white rounded-2xl p-6 shadow-sm border border-gray-200`}
    >
      {/* Mobile Header */}
      {isMobile && (
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <h2 className="text-2xl font-bold">Filters</h2>
          <button
            onClick={() => setShowMobileFilters(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Filters</h3>
        <button
          onClick={resetFilters}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          Reset All
        </button>
      </div>

      <div className="space-y-6">
        {/* Example Filters (using same logic) */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Quick Filters</h4>
          <div className="space-y-2">
            <Checkbox
              checked={filters.inStock}
              onChange={(e) => handleFilterChange("inStock", e.target.checked)}
            >
              <span className="text-gray-700">In Stock Only</span>
            </Checkbox>
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Price Range</h4>
          <Slider
            range
            min={0}
            max={5000}
            step={50}
            value={[filters.minPrice || 0, filters.maxPrice || 5000]}
            onChange={([min, max]) => {
              handleFilterChange("minPrice", min);
              handleFilterChange("maxPrice", max);
            }}
            tooltip={{
              formatter: (value) => `$${value}`,
            }}
          />
        </div>

        {/* Rating Filter */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Minimum Rating</h4>
          <Radio.Group
            value={filters.minRating || 0}
            onChange={(e) => handleFilterChange("minRating", e.target.value)}
            className="flex flex-col space-y-2"
          >
            <Radio value={0}>
              <span className="text-gray-700">All Ratings</span>
            </Radio>
            {[4, 3, 2, 1].map((rating) => (
              <Radio key={rating} value={rating}>
                <div className="flex items-center">
                  <Rate disabled defaultValue={rating} className="text-sm" />
                  <span className="ml-2 text-gray-600">& Up</span>
                </div>
              </Radio>
            ))}
          </Radio.Group>
        </div>
      </div>

      {isMobile && (
        <div className="mt-6 pt-4 border-t">
          <button
            onClick={() => setShowMobileFilters(false)}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Apply Filters ({safeProducts.length} Products)
          </button>
        </div>
      )}
    </div>
  );

  // ============================
  // Loading / Error
  // ============================
  if (categoryLoading || productsLoading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (categoryError || productsError) {
    return (
      <div className="p-10 text-center text-red-600">
        Error loading data. Try again later.
      </div>
    );
  }

  // ============================
  // MAIN RENDER
  // ============================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <button
              onClick={() => router.push("/")}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Home
            </button>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <button
              onClick={() => router.push(`/category/${params.slug}`)}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              {category?.name}
            </button>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-gray-600">
            {pagination?.totalProducts || safeProducts.length} Products Found
          </p>
        </div>

        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-white border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal className="h-5 w-5" />
            <span>Filters & Sort</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="hidden lg:block">
            <FilterSidebar />
          </div>

          <div className="lg:col-span-3">
            {safeProducts.length > 0 ? (
              <Row gutter={[24, 24]}>
                {safeProducts.map((product: any) => (
                  <Col key={product._id} xs={24} sm={12} md={8} xl={8}>
                    <ProductCard
                      id={product._id}
                      name={product.name}
                      image={product.images[0] || "/products/placeholder.jpg"}
                      priceUSD={product.salePrice || product.basePrice}
                      originalPriceUSD={product.basePrice}
                      rating={product.averageRating}
                      reviewCount={product.reviewCount}
                      discount={product.offers?.discountPercentage}
                      inStock={product.stock > 0}
                      isNew={product.isNew}
                      isBestSeller={product.isBestSeller}

                      onAddToCart={handleAddToCart}
                      onAddToWishlist={handleAddToWishlist}
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  No Products Found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters to see more results
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showMobileFilters && <FilterSidebar isMobile />}
    </div>
  );
}
