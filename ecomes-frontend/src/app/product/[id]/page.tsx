"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Row,
  Col,
  Button,
  Rate,
  InputNumber,
  Radio,
  Tabs,
  Divider,
  Tag,
  Space,
  Avatar,
  message,
  Spin,
} from "antd";
import {
  ShoppingCartOutlined,
  HeartOutlined,
  ShareAltOutlined,
  ZoomInOutlined,
  PlayCircleOutlined,
  LoadingOutlined,
  HeartFilled,
} from "@ant-design/icons";
import Image from "next/image";
import { useSettings } from "@/contexts/settingsContext";
import { useTheme } from "@/contexts/ThemeContext";
import { themeConfig } from "@/lib/theme";
import { cartWishlistAPI } from "@/services/cartWishlistService";

interface ProductImage {
  id?: string;
  url: string;
  type: "image" | "video";
}

interface ProductVariant {
  color: string;
  size: string;
  sku: string;
  price: number;
  stock: number;
  images: string[];
  _id?: string;
}

interface ProductDocument {
  _id?: string;
  name: string;
  type: string;
  fileUrl: string;
  fileSize: number;
}

interface ProductData {
  _id: string;
  name: string;
  description?: string;
  shortDescription: string;
  basePrice: number;
  salePrice: number;
  currency: string;
  averageRating: number;
  reviewCount: number;
  stock: number;
  lowStockThreshold: number;
  brand: string;
  category: string;
  subcategory: string;
  images: string[];
  videos?: string[];
  image360?: string[];
  variants: ProductVariant[];
  features: string[];
  tags: string[];
  productDocuments?: ProductDocument[];
  offers: {
    discountPercentage: number;
    isOnSale: boolean;
    saleEndDate: string;
    freeShipping: boolean;
  };
  shipping: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    freeShippingEligible: boolean;
    shippingCost: number;
  };
  company: {
    name: string;
    description: string;
    contactEmail: string;
    website: string;
    logo: string;
    aboutPdf: string;
  };
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  seo?: {
    metaTitle: string;
    metaDescription: string;
    slug: string;
    keywords: string[];
  };
  reviews?: Review[];
}

interface Review {
  _id: string;
  user: {
    _id: string;
    email: string;
    username?: string;
  };
  rating: number;
  comment: string;
  images?: string[];
  verifiedPurchase: boolean;
  helpful: number;
  createdAt: string;
  updatedAt: string;
}

const ProductDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const { formatPrice, currency } = useSettings();
  const { theme } = useTheme();
  const t = themeConfig[theme];

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // console.log(product);


  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`http://localhost:5000/api/products/${productId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch product: ${response.statusText}`);
        }

        const data = await response.json();
        setProduct(data?.data);

        // Set initial variant selections
        if (data.variants && data.variants.length > 0) {
          setSelectedColor(data.variants[0].color);
          setSelectedSize(data.variants[0].size);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="text-center">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
          <p className={`mt-4 ${t.text}`}>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="text-center">
          <p className="text-red-500 mb-4">
            {error || "Product not found"}
          </p>
          <Button type="primary" onClick={() => router.push("/")}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // Get available colors and sizes from variants
  const availableColors = product.variants && product.variants.length > 0
    ? [...new Set(product.variants.map((v) => v.color))]
    : [];
  const availableSizes = product.variants && product.variants.length > 0
    ? product.variants
      .filter((v) => v.color === selectedColor)
      .map((v) => v.size)
    : [];

  // Get current variant based on selected color and size
  const currentVariant = product.variants && product.variants.length > 0
    ? product.variants.find(
      (v) => v.color === selectedColor && v.size === selectedSize
    )
    : undefined;

  const handleAddToCart = async () => {
    try {
      // Check if user is logged in
      const token = localStorage.getItem("accessToken");
      if (!token) {
        message.warning("Please login to add items to cart");
        router.push("/auth/login");
        return;
      }

      setAddingToCart(true);

      await cartWishlistAPI.addToCart({
        productId: product!._id,
        quantity,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
      });

      message.success(`Added ${quantity} item(s) to cart!`);
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      if (error.response?.status === 401) {
        message.error("Please login to add items to cart");
        router.push("/auth/login");
      } else {
        message.error(error.response?.data?.message || "Failed to add to cart");
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    try {
      // Check if user is logged in
      const token = localStorage.getItem("accessToken");
      if (!token) {
        message.warning("Please login to add items to wishlist");
        router.push("/auth/login");
        return;
      }

      setAddingToWishlist(true);

      if (isInWishlist) {
        await cartWishlistAPI.deleteWishlistItem(product!._id);
        setIsInWishlist(false);
        message.success("Removed from wishlist");
      } else {
        await cartWishlistAPI.addToWishlist({
          productId: product!._id,
        });
        setIsInWishlist(true);
        message.success("Added to wishlist!");
      }
    } catch (error: any) {
      console.error("Error updating wishlist:", error);
      if (error.response?.status === 401) {
        message.error("Please login to manage wishlist");
        router.push("/auth/login");
      } else {
        message.error(error.response?.data?.message || "Failed to update wishlist");
      }
    } finally {
      setAddingToWishlist(false);
    }
  };

  const handleBuyNow = () => {
    message.info("Proceeding to checkout...");
  };

  // Combine all media (images + videos)
  const allMedia: ProductImage[] = [
    ...(product.images || []).map((url, idx) => ({ id: `img-${idx}`, url, type: "image" as const })),
    ...(product.videos || []).map((url, idx) => ({ id: `vid-${idx}`, url, type: "video" as const })),
  ];

  return (
    <div className={`min-h-screen ${t.bg} transition-all duration-300`}>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Row gutter={[48, 48]}>
          {/* Left Side - Images */}
          <Col xs={24} md={12}>
            <div className="sticky top-4">
              {/* Main Image */}
              <div className={`relative mb-4 overflow-hidden rounded-lg border ${t.border} ${t.card}`}>
                <div className="relative h-[500px]">
                  {allMedia[selectedImage]?.type === "video" ? (
                    <video
                      controls
                      className="h-full w-full object-contain"
                      src={allMedia[selectedImage]?.url}
                    />
                  ) : (
                    <>
                      <Image
                        src={allMedia[selectedImage]?.url || "/placeholder.jpg"}
                        alt={product.name}
                        fill
                        className={`object-contain transition-transform ${isZoomed
                          ? "scale-150 cursor-zoom-out"
                          : "cursor-zoom-in"
                          }`}
                        onClick={() => setIsZoomed(!isZoomed)}
                      />
                      <Button
                        icon={<ZoomInOutlined />}
                        className="absolute right-4 top-4 bg-white"
                        onClick={() => setIsZoomed(!isZoomed)}
                      >
                        Zoom
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Thumbnail Images */}
              <div className="flex gap-2 overflow-x-auto">
                {allMedia.map((media, idx) => (
                  <div
                    key={media.id}
                    className={`relative h-20 w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-md border-2 ${selectedImage === idx
                      ? "border-blue-500"
                      : `border-gray-200 ${t.border}`
                      }`}
                    onClick={() => setSelectedImage(idx)}
                  >
                    {media.type === "video" ? (
                      <div className={`flex h-full items-center justify-center ${t.card}`}>
                        <PlayCircleOutlined className="text-2xl text-gray-600" />
                      </div>
                    ) : (
                      <Image
                        src={media.url}
                        alt={`Product ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* 360° View Button */}
              {product.image360 && product.image360.length > 0 && (
                <Button
                  block
                  size="large"
                  className="mt-4"
                  icon={<span className="mr-2">🔄</span>}
                  onClick={() => {
                    message.info("360° view feature coming soon!");
                  }}
                >
                  View 360° Product Tour
                </Button>
              )}
            </div>
          </Col>

          {/* Right Side - Product Details */}
          <Col xs={24} md={12}>
            <div className="space-y-6">
              {/* Brand & Title */}
              <div>
                <Tag color="pink">{product.brand}</Tag>
                <h1 className={`mt-2 text-3xl font-bold ${t.text}`}>
                  {product.name}
                </h1>
                <p className={`mt-2 text-sm ${t.textSecondary}`}>
                  SKU: {currentVariant?.sku || (product.variants && product.variants[0]?.sku) || 'N/A'}
                </p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4">
                <Rate disabled defaultValue={product.averageRating || 0} allowHalf />
                <span className={`text-sm ${t.textSecondary}`}>
                  {product.averageRating || 0} ({product.reviewCount || 0} reviews)
                </span>
              </div>

              <Divider />

              {/* Price */}
              <div>
                <div className="flex items-baseline gap-3">
                  <span className={`text-4xl font-bold ${t.text}`}>
                    {formatPrice(product.salePrice)}
                  </span>
                  {product.basePrice > product.salePrice && (
                    <span className="text-xl text-gray-400 line-through">
                      {formatPrice(product.basePrice)}
                    </span>
                  )}
                  {product.offers?.discountPercentage && product.offers.discountPercentage > 0 && (
                    <Tag color="red">
                      Save {product.offers.discountPercentage}%
                    </Tag>
                  )}
                </div>
                {product.offers?.freeShipping && (
                  <p className="mt-2 text-sm text-green-600">
                    ✓ Free Shipping Available
                  </p>
                )}
                <p className="mt-1 text-sm text-green-600">
                  ✓ In Stock ({currentVariant?.stock || product.stock}{" "}
                  available)
                </p>
                {product.offers?.isOnSale && product.offers.saleEndDate && (
                  <p className="mt-1 text-sm text-orange-600">
                    🏃‍♀️ Sale ends:{" "}
                    {new Date(product.offers.saleEndDate).toLocaleDateString()}
                  </p>
                )}
              </div>

              <Divider />

              {/* Color Selection */}
              {availableColors.length > 0 && (
                <div>
                  <h3 className={`mb-3 text-sm font-semibold ${t.text}`}>
                    Color: {selectedColor}
                  </h3>
                  <Radio.Group
                    value={selectedColor}
                    onChange={(e) => {
                      setSelectedColor(e.target.value);
                      // Reset to first available size when color changes
                      const sizesForColor = product.variants
                        .filter((v) => v.color === e.target.value)
                        .map((v) => v.size);
                      setSelectedSize(sizesForColor[0]);
                    }}
                  >
                    <Space wrap>
                      {availableColors.map((color) => (
                        <Radio.Button key={color} value={color} className="h-12">
                          <div className="flex items-center gap-2">{color}</div>
                        </Radio.Button>
                      ))}
                    </Space>
                  </Radio.Group>
                </div>
              )}

              {/* Size Selection */}
              {availableSizes.length > 0 && (
                <div>
                  <h3 className={`mb-3 text-sm font-semibold ${t.text}`}>
                    Size: {selectedSize}
                  </h3>
                  <Radio.Group
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    buttonStyle="solid"
                  >
                    <Space wrap>
                      {availableSizes.map((size) => (
                        <Radio.Button
                          key={size}
                          value={size}
                          className="min-w-[60px]"
                        >
                          {size}
                        </Radio.Button>
                      ))}
                    </Space>
                  </Radio.Group>
                </div>
              )}

              {/* Quantity */}
              <div>
                <h3 className={`mb-3 text-sm font-semibold ${t.text}`}>
                  Quantity
                </h3>
                <InputNumber
                  min={1}
                  max={currentVariant?.stock || product.stock}
                  value={quantity}
                  onChange={(val) => setQuantity(val || 1)}
                  size="large"
                  className="w-32"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<ShoppingCartOutlined />}
                  className="h-14 bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500 text-lg font-semibold border-none hover:opacity-90"
                  onClick={handleAddToCart}
                  loading={addingToCart}
                  disabled={addingToCart}
                >
                  {addingToCart ? "Adding..." : "Add to Cart"}
                </Button>
                <Button
                  size="large"
                  block
                  className="h-14 text-lg font-semibold"
                  onClick={handleBuyNow}
                >
                  Buy Now
                </Button>
                <div className="flex gap-2">
                  <Button
                    icon={isInWishlist ? <HeartFilled /> : <HeartOutlined />}
                    size="large"
                    className="flex-1"
                    onClick={handleAddToWishlist}
                    loading={addingToWishlist}
                    disabled={addingToWishlist}
                    danger={isInWishlist}
                  >
                    {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                  </Button>
                  <Button
                    icon={<ShareAltOutlined />}
                    size="large"
                    className="flex-1"
                  >
                    Share
                  </Button>
                </div>
              </div>

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div className={`rounded-lg ${t.card} p-4 border ${t.border}`}>
                  <h3 className={`mb-3 font-semibold ${t.text}`}>Key Features:</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {product.features.slice(0, 6).map((feature, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-2 text-sm ${t.text}`}
                      >
                        <span className="text-green-500">✓</span>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Col>
        </Row>

        {/* Tabs Section */}
        <div className="mt-16">
          <Tabs
            defaultActiveKey="1"
            size="large"
            items={[
              {
                key: "1",
                label: "Description",
                children: (
                  <div className="prose max-w-none py-6">
                    <h2 className={`text-2xl font-bold ${t.text}`}>Product Description</h2>
                    <div className={`mt-4 ${t.text}`} dangerouslySetInnerHTML={{ __html: product.description || product.shortDescription }} />

                    {product.features && product.features.length > 0 && (
                      <>
                        <h3 className={`mt-6 text-xl font-semibold ${t.text}`}>
                          Key Features:
                        </h3>
                        <ul className={`mt-3 space-y-2 ${t.text}`}>
                          {product.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </>
                    )}

                    {/* Product Documents */}
                    {product.productDocuments && product.productDocuments.length > 0 && (
                      <>
                        <h3 className={`mt-8 text-xl font-semibold ${t.text}`}>
                          Product Documents
                        </h3>
                        <div className="mt-4 space-y-3">
                          {product.productDocuments.map((doc, index) => (
                            <div key={index} className={`flex items-center justify-between p-4 rounded-lg border ${t.border} ${t.card}`}>
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                  <span className="text-2xl">📄</span>
                                </div>
                                <div>
                                  <div className={`font-semibold ${t.text}`}>{doc.name}</div>
                                  <div className={`text-sm ${t.textSecondary}`}>
                                    {doc.type.charAt(0).toUpperCase() + doc.type.slice(1)} • {(doc.fileSize / 1024).toFixed(1)} KB
                                  </div>
                                </div>
                              </div>
                              <Button
                                type="primary"
                                href={doc.fileUrl}
                                target="_blank"
                                icon={<span>📥</span>}
                              >
                                Download
                              </Button>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ),
              },
              {
                key: "2",
                label: "Specifications",
                children: (
                  <div className="py-6">
                    <h2 className={`mb-6 text-2xl font-bold ${t.text}`}>
                      Technical Specifications
                    </h2>
                    <div className="space-y-4">
                      <div className={`flex border-b ${t.border} pb-3`}>
                        <div className={`w-1/3 font-semibold ${t.text}`}>Brand</div>
                        <div className={`w-2/3 ${t.textSecondary}`}>{product.brand}</div>
                      </div>
                      <div className={`flex border-b ${t.border} pb-3`}>
                        <div className={`w-1/3 font-semibold ${t.text}`}>Category</div>
                        <div className={`w-2/3 ${t.textSecondary}`}>{product.category}</div>
                      </div>
                      {product.dimensions && (
                        <div className={`flex border-b ${t.border} pb-3`}>
                          <div className={`w-1/3 font-semibold ${t.text}`}>Dimensions</div>
                          <div className={`w-2/3 ${t.textSecondary}`}>
                            {product.dimensions.length} x {product.dimensions.width} x {product.dimensions.height} {product.dimensions.unit}
                          </div>
                        </div>
                      )}
                      {product.shipping && (
                        <div className={`flex border-b ${t.border} pb-3`}>
                          <div className={`w-1/3 font-semibold ${t.text}`}>Weight</div>
                          <div className={`w-2/3 ${t.textSecondary}`}>{product.shipping.weight}g</div>
                        </div>
                      )}
                    </div>
                  </div>
                ),
              },
              {
                key: "3",
                label: `Reviews (${product.reviewCount})`,
                children: (
                  <div className="py-6">
                    {/* Rating Summary */}
                    <div className={`mb-8 rounded-lg ${t.card} p-6 border ${t.border}`}>
                      <Row gutter={48}>
                        <Col xs={24} md={8}>
                          <div className="text-center">
                            <div className={`text-5xl font-bold ${t.text}`}>
                              {(product.averageRating || 0).toFixed(1)}
                            </div>
                            <Rate
                              disabled
                              defaultValue={product.averageRating || 0}
                              allowHalf
                              className="my-2"
                            />
                            <div className={t.textSecondary}>
                              Based on {product.reviewCount || 0} reviews
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </div>

                    {/* Reviews List */}
                    {product.reviews && product.reviews.length > 0 ? (
                      <div className="space-y-6">
                        {product.reviews.map((review) => (
                          <div
                            key={review._id}
                            className={`rounded-lg ${t.card} p-6 border ${t.border}`}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <Avatar size={48} className="bg-blue-500">
                                  {review.user.email[0].toUpperCase()}
                                </Avatar>
                                <div>
                                  <div className={`font-semibold ${t.text}`}>
                                    {review.user.username || review.user.email.split('@')[0]}
                                  </div>
                                  <div className={`text-sm ${t.textSecondary}`}>
                                    {review.user.email}
                                  </div>
                                  <div className={`text-xs ${t.textSecondary} mt-1`}>
                                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <Rate disabled value={review.rating} className="text-sm" />
                                {review.verifiedPurchase && (
                                  <Tag color="green" className="mt-2">
                                    Verified Purchase
                                  </Tag>
                                )}
                              </div>
                            </div>

                            {review.comment && (
                              <p className={`${t.text} leading-relaxed`}>
                                {review.comment}
                              </p>
                            )}

                            {review.images && review.images.length > 0 && (
                              <div className="flex gap-2 mt-4">
                                {review.images.map((img, idx) => (
                                  <div key={idx} className="relative w-20 h-20 rounded overflow-hidden">
                                    <Image
                                      src={img}
                                      alt={`Review image ${idx + 1}`}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={`text-center py-8 ${t.textSecondary}`}>
                        <p>No reviews yet. Be the first to review this product!</p>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: "4",
                label: "Company Details",
                children: (
                  <div className="py-6">
                    {product.company ? (
                      <>
                        <h2 className={`mb-6 text-2xl font-bold ${t.text}`}>
                          About {product.company.name}
                        </h2>
                        <div className="space-y-6">
                          {product.company.logo && (
                            <div className="flex justify-center p-6 bg-gray-50 rounded-lg">
                              <Image
                                src={product.company.logo}
                                alt={`${product.company.name} logo`}
                                width={200}
                                height={120}
                                className="object-contain"
                              />
                            </div>
                          )}

                          <div className={`${t.text} leading-relaxed`}>
                            {product.company.description}
                          </div>

                          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg border ${t.border} ${t.card}`}>
                            <div>
                              <div className={`text-sm ${t.textSecondary} mb-1`}>Contact Email</div>
                              <a href={`mailto:${product.company.contactEmail}`} className="text-blue-600 font-medium">
                                {product.company.contactEmail}
                              </a>
                            </div>
                            {product.company.website && (
                              <div>
                                <div className={`text-sm ${t.textSecondary} mb-1`}>Website</div>
                                <a
                                  href={product.company.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 font-medium"
                                >
                                  {product.company.website}
                                </a>
                              </div>
                            )}
                          </div>

                          {product.company.aboutPdf && (
                            <div className={`p-6 rounded-lg border ${t.border} ${t.card}`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <span className="text-3xl">📋</span>
                                  </div>
                                  <div>
                                    <div className={`font-semibold text-lg ${t.text}`}>Company Profile</div>
                                    <div className={`text-sm ${t.textSecondary}`}>Detailed information about {product.company.name}</div>
                                  </div>
                                </div>
                                <Button
                                  type="primary"
                                  size="large"
                                  href={product.company.aboutPdf}
                                  target="_blank"
                                  icon={<span className="mr-2">📥</span>}
                                >
                                  Download PDF
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className={t.textSecondary}>Company information not available.</p>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
