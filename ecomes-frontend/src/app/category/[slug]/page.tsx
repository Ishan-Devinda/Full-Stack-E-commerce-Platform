"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Row, Col, Skeleton, Select, Pagination } from "antd";
import { ChevronRight, RefreshCw, Filter } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useCategoryData } from "@/hooks/useCategoryData";
import { useProducts } from "@/hooks/useProducts";
import { useProductFilters } from "@/hooks/useProductFilters";

// ============================================
// TYPES
// ============================================

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
  onSale?: boolean;
  brand: string;
  categoryId: string;
  subCategoryId: string;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Convert category ID to display name
const getCategoryDisplayName = (categoryId: string): string => {
  const words = categoryId.split(/[-_]/);
  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Get emoji for category
const getCategoryEmoji = (categoryId: string): string => {
  const emojiMap: Record<string, string> = {
    electronics: "📱",
    clothing: "👕",
    shoes: "👟",
    furniture: "🛋️",
    "home-appliances": "🏠",
    phones: "📞",
    laptops: "💻",
    accessories: "👓",
    "jewelry-watches": "⌚",
  };
  return emojiMap[categoryId] || "🛍️";
};

// Get color gradient for category
const getCategoryColor = (categoryId: string): string => {
  const colorMap: Record<string, string> = {
    electronics: "from-blue-500 to-cyan-500",
    clothing: "from-pink-500 to-rose-500",
    shoes: "from-indigo-500 to-blue-500",
    furniture: "from-amber-500 to-orange-500",
    "home-appliances": "from-green-500 to-emerald-500",
    phones: "from-purple-500 to-pink-500",
    laptops: "from-gray-500 to-slate-500",
    accessories: "from-yellow-500 to-amber-500",
    "jewelry-watches": "from-red-500 to-pink-500",
  };
  return colorMap[categoryId] || "from-gray-500 to-slate-500";
};

// Format subcategory name
const formatSubcategoryName = (subcategory: string): string => {
  return subcategory
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Get emoji for subcategory
const getSubcategoryEmoji = (subcategory: string): string => {
  const emojiMap: Record<string, string> = {
    "men-tops": "👕",
    "women-dresses": "👗",
    smartphones: "📱",
    "sofas-sectionals": "🛋️",
    "running-shoes": "👟",
  };
  return emojiMap[subcategory] || "📦";
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();

  // Unwrap the params promise
  const unwrappedParams = React.use(params);
  const { slug } = unwrappedParams;

  const {
    category,
    loading: categoryLoading,
    error: categoryError,
    refreshData,
  } = useCategoryData(slug);

  // Use product filters for category page
  const { filters, updateFilter, setPage } = useProductFilters({
    category: slug,
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

  // Generate subcategories data from API response
  const subCategoriesData =
    category?.subcategories.map((subCat, index) => ({
      id: `${index + 1}`,
      name: formatSubcategoryName(subCat),
      slug: subCat,
      productCount: Math.floor(Math.random() * 200) + 50,
      image: getSubcategoryEmoji(subCat),
    })) || [];

  const handleSubCategoryClick = (subCategorySlug: string) => {
    router.push(`/category/${slug}/${subCategorySlug}`);
  };

  const handleAddToCart = (productId: string) => {
    console.log("Add to cart:", productId);
    // Implement your cart logic here
  };

  const handleAddToWishlist = (productId: string) => {
    console.log("Add to wishlist:", productId);
    // Implement your wishlist logic here
  };

  const handleSortChange = (value: string) => {
    updateFilter("sortBy", value);
  };

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  // Loading state for category
  if (categoryLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Skeleton.Button active size="small" style={{ width: 200 }} />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton active paragraph={{ rows: 4 }} />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-8">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} active avatar paragraph={{ rows: 2 }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state for category
  if (categoryError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-4 text-gray-900">
            Error Loading Category
          </h1>
          <p className="text-gray-600 mb-6 max-w-md">{categoryError}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={refreshData}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Category not found
  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            Category Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The category "{slug}" doesn't exist.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const categoryName = getCategoryDisplayName(category._id);
  const categoryEmoji = getCategoryEmoji(category._id);
  const categoryColor = getCategoryColor(category._id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
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
            <span className="text-gray-900 font-medium">{categoryName}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ========================================== */}
        {/* COMPONENT 1: Category Header */}
        {/* ========================================== */}
        <div
          className={`bg-gradient-to-r ${categoryColor} rounded-3xl p-8 md:p-12 mb-12 text-white shadow-xl`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {categoryName}
              </h1>
              <p className="text-lg md:text-xl opacity-90 mb-6">
                Discover amazing products in {categoryName.toLowerCase()}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                  {subCategoriesData.length} Subcategories
                </span>
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                  {category.count}+ Products
                </span>
              </div>
            </div>
            <div className="text-7xl md:text-9xl hidden md:block">
              {categoryEmoji}
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* COMPONENT 2: Subcategories Grid */}
        {/* ========================================== */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Browse by Subcategory
          </h2>

          {subCategoriesData.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Subcategories Found
              </h3>
              <p className="text-gray-600">
                There are no subcategories available for this category yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {subCategoriesData.map((subCat) => (
                <button
                  key={subCat.id}
                  onClick={() => handleSubCategoryClick(subCat.slug)}
                  className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all transform hover:scale-105 border border-gray-200 group"
                >
                  <div className="text-5xl md:text-6xl mb-4 group-hover:scale-110 transition-transform">
                    {subCat.image}
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                    {subCat.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {subCat.productCount} Products
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ========================================== */}
        {/* COMPONENT 3: Products with Filtering */}
        {/* ========================================== */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Products
              </h2>
              {pagination && (
                <p className="text-gray-600 mt-1">
                  Showing {products.length} of {pagination.totalProducts}{" "}
                  products
                </p>
              )}
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-4">
              <Select
                value={filters.sortBy}
                onChange={handleSortChange}
                className="w-48"
                suffixIcon={<Filter className="h-4 w-4" />}
              >
                <Select.Option value="createdAt">Newest First</Select.Option>
                <Select.Option value="price">Price: Low to High</Select.Option>
                <Select.Option value="-price">Price: High to Low</Select.Option>
                <Select.Option value="rating">Top Rated</Select.Option>
                <Select.Option value="name">Name: A to Z</Select.Option>
                <Select.Option value="discount">Best Discount</Select.Option>
              </Select>
            </div>
          </div>

          {/* Products Grid */}
          {productsLoading ? (
            <Row gutter={[24, 24]}>
              {[...Array(8)].map((_, i) => (
                <Col key={i} xs={24} sm={12} md={8} lg={6}>
                  <Skeleton active avatar paragraph={{ rows: 3 }} />
                </Col>
              ))}
            </Row>
          ) : productsError ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Error Loading Products
              </h3>
              <p className="text-gray-600 mb-6">{productsError}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center mx-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </button>
            </div>
          ) : safeProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Products Found
              </h3>
              <p className="text-gray-600">
                No products found in this category. Try different filters.
              </p>
            </div>
          ) : (
            <>
              <Row gutter={[24, 24]}>
                {safeProducts.map((product) => (
                  <Col key={product._id} xs={24} sm={12} md={8} lg={6}>
                    <ProductCard
                      id={product._id}
                      name={product.name}
                      image={product.images?.[0] || "/products/placeholder.jpg"}
                      price={product.price}
                      originalPrice={product.originalPrice}
                      rating={product.rating}
                      reviewCount={product.reviewCount}
                      discount={product.discount}
                      inStock={product.inStock}
                      isNew={product.isNew}
                      isBestSeller={product.isBestSeller}
                      currency="USD"
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
                    pageSize={filters.limit}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                    showQuickJumper
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
