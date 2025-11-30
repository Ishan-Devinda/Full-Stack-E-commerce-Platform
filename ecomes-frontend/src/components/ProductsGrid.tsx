"use client";
// components/ProductsGrid.tsx
import React from "react";
import { Row, Col, Button } from "antd";
import ProductCard from "./ProductCard";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  currency: string;
  rating: number;
  reviewCount: number;
  image: string;
  additionalImages?: string[];
  video?: string;
  isInStock: boolean;
  isWishlisted?: boolean;
  badge?: string;
  isAd?: boolean;
}

interface ProductsGridProps {
  products: Product[];
  title?: string;
  showViewAll?: boolean;
}

const ProductsGrid: React.FC<ProductsGridProps> = ({
  products,
  title = "Today's Best Deals For You!",
  showViewAll = true,
}) => {
  const handleAddToCart = (product: Product) => {
    console.log("Add to cart:", product);
    // Implement add to cart logic
  };

  const handleAddToWishlist = (product: Product) => {
    console.log("Add to wishlist:", product);
    // Implement wishlist logic
  };

  const handleQuickView = (product: Product) => {
    console.log("Quick view:", product);
    // Implement quick view modal
  };

  return (
    <div className="bg-white p-6 rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {showViewAll && (
          <Button type="link" className="text-blue-600 font-semibold">
            View All &gt;
          </Button>
        )}
      </div>

      {/* Products Grid */}
      <Row gutter={[16, 24]}>
        {products.map((product) => (
          <Col key={product.id} xs={24} sm={12} md={8} lg={6} xl={6}>
            <ProductCard
              product={product}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
              onQuickView={handleQuickView}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ProductsGrid;
