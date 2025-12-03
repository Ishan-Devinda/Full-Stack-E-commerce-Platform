"use client";

import React, { useState } from "react";
import { Card, Rate, Button, Tooltip, Tag, message } from "antd";
import {
  HeartOutlined,
  HeartFilled,
  ShoppingCartOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";
import { useSettings } from "@/contexts/settingsContext";
import { themeConfig } from "@/lib/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { cartWishlistAPI } from "@/services/cartWishlistService";

interface ProductCardProps {
  id: string;
  name: string;
  image: string;
  priceUSD: number;
  originalPriceUSD?: number;
  rating: number;
  reviewCount: number;
  discount?: number;
  inStock: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  onAddToCart?: (id: string) => void;
  onAddToWishlist?: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  image,
  priceUSD,
  originalPriceUSD,
  rating,
  reviewCount,
  discount,
  inStock,
  isNew,
  isBestSeller,
  onAddToCart,
  onAddToWishlist,
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const { formatPrice } = useSettings();

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setLoading(true);

      if (isWishlisted) {
        await cartWishlistAPI.deleteWishlistItem(id);
        message.success("Removed from wishlist");
        setIsWishlisted(false);
      } else {
        await cartWishlistAPI.addToWishlist({ productId: id });
        message.success("Added to wishlist");
        setIsWishlisted(true);
      }

      onAddToWishlist?.(id);
    } catch (error: any) {
      console.error("Wishlist error:", error);
      message.error(error.response?.data?.message || "Failed to update wishlist");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setLoading(true);
      await cartWishlistAPI.addToCart({ productId: id, quantity: 1 });
      message.success("Added to cart");

      onAddToCart?.(id);
    } catch (error: any) {
      console.error("Add to cart error:", error);
      message.error(error.response?.data?.message || "Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  const { theme } = useTheme();
  const t = themeConfig[theme];

  return (
    <Link href={`/product/${id}`}>
      <Card
        styles={{
          body: {
            padding: "16px",
          },
        }}
        hoverable
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`relative overflow-hidden rounded-2xl border  ${t.border} ${t.card} ${t.shadowSm} ${t.bg} transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 `}
        cover={
          <div
            className={`relative h-64 w-full overflow-hidden rounded-t-2xl ${t.bg}`}
          >
            <Image
              src={image}
              alt={name}
              fill
              className={`object-cover transition-transform duration-700 ${hovered ? "scale-110" : "scale-100"
                }`}
            />

            {/* Gradient overlay on hover */}
            <div
              className={`absolute inset-0 transition-opacity duration-700 ${hovered
                  ? "opacity-60 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
                  : "opacity-0"
                }`}
            ></div>

            {/* Wishlist Button */}

            <div className="absolute right-3 top-3 flex flex-col gap-2 z-50">
              {" "}
              <Tooltip
                title={
                  isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"
                }
              >
                <Button
                  type="text"
                  shape="circle"
                  size="large"
                  loading={loading}
                  icon={
                    isWishlisted ? (
                      <HeartFilled className="text-red-500 text-5xl " />
                    ) : (
                      <HeartOutlined className={`text-lg ${t.text}`} />
                    )
                  }
                  onClick={handleWishlist}
                  className="w-10"
                />
              </Tooltip>
            </div>

            {/* Product Tags */}
            <div className="absolute left-3 top-3 flex flex-col gap-2">
              {isNew && <Tag color="blue">NEW</Tag>}
              {isBestSeller && <Tag color="gold">BEST</Tag>}
              {discount && <Tag color="red">{discount}% OFF</Tag>}
            </div>
          </div>
        }
      //bodyStyle={{ padding: "12px" }}
      >
        {/* Product Info */}
        <div className="space-y-1">
          <h3
            className={`line-clamp-2 text-sm font-semibold ${t.text} transition-colors group-hover:text-pink-500 truncate`}
          >
            {name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <Rate
              disabled
              defaultValue={rating}
              allowHalf
              className="text-xs"
            />
            <span className={`text-[10px] ${t.text}`}>({reviewCount})</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-base font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500 bg-clip-text text-transparent">
              {formatPrice(priceUSD)}
            </span>
            {originalPriceUSD && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(originalPriceUSD)}
              </span>
            )}
          </div>

          {/* Add to Cart */}
          <Button
            type="primary"
            block
            icon={<ShoppingCartOutlined />}
            disabled={!inStock}
            loading={loading}
            onClick={handleAddToCart}
            className={`mt-3 py-2 font-semibold rounded-lg transition-all
              ${inStock
                ? "bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500 hover:opacity-90"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
          >
            {inStock ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>
      </Card>
    </Link>
  );
};

export default ProductCard;
