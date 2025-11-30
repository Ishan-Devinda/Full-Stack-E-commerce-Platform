"use client";
// pages/product/[id].tsx
import React, { useState } from "react";
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
  Progress,
  message,
} from "antd";
import {
  ShoppingCartOutlined,
  HeartOutlined,
  ShareAltOutlined,
  ZoomInOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import Image from "next/image";

interface ProductImage {
  id: string;
  url: string;
  type: "image" | "video";
}

const ProductDetailPage: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState("Rose Pink/White");
  const [selectedSize, setSelectedSize] = useState("6");
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);

  // Product data from response
  const product = {
    id: "68e3ba1732a110e88cb88236",
    name: "Women's CloudComfort Running Shoes",
    description:
      "Designed specifically for women, these CloudComfort running shoes combine style with performance. Featuring cloud-like cushioning and breathable knit upper for all-day comfort during workouts or casual wear.",
    shortDescription:
      "Women's running shoes with cloud-like cushioning and stylish design",
    basePrice: 119.99,
    salePrice: 89.99,
    currency: "USD",
    rating: 2,
    reviewCount: 1,
    stock: 101,
    lowStockThreshold: 8,
    brand: "FitFemme",
    category: "shoes",
    subcategory: "running-shoes",
    images: [
      {
        id: "1",
        url: "https://res.cloudinary.com/dofsj68au/image/upload/v1759248871/shoes/women_cloud_front.jpg",
        type: "image",
      },
      {
        id: "2",
        url: "https://res.cloudinary.com/dofsj68au/image/upload/v1759248871/shoes/women_cloud_side.jpg",
        type: "image",
      },
      {
        id: "3",
        url: "https://res.cloudinary.com/dofsj68au/image/upload/v1759248871/shoes/women_cloud_back.jpg",
        type: "image",
      },
      {
        id: "4",
        url: "https://res.cloudinary.com/dofsj68au/image/upload/v1759248871/shoes/women_cloud_top.jpg",
        type: "image",
      },
    ] as ProductImage[],
    videos: [
      {
        id: "video1",
        url: "https://res.cloudinary.com/dofsj68au/video/upload/v1759248871/shoes/women_shoes_video.mp4",
        type: "video",
      },
    ] as ProductImage[],
    image360: [
      {
        id: "360-1",
        url: "https://res.cloudinary.com/dofsj68au/image/upload/v1759248871/shoes/women_360_1.jpg",
        type: "image",
      },
      {
        id: "360-2",
        url: "https://res.cloudinary.com/dofsj68au/image/upload/v1759248871/shoes/women_360_2.jpg",
        type: "image",
      },
      {
        id: "360-3",
        url: "https://res.cloudinary.com/dofsj68au/image/upload/v1759248871/shoes/women_360_3.jpg",
        type: "image",
      },
    ] as ProductImage[],
    variants: [
      {
        color: "Rose Pink/White",
        size: "6",
        sku: "FF-CC-RP-6",
        price: 89.99,
        stock: 18,
        images: [
          "https://res.cloudinary.com/dofsj68au/image/upload/v1759248871/shoes/pink_white_6.jpg",
        ],
      },
      {
        color: "Rose Pink/White",
        size: "7",
        sku: "FF-CC-RP-7",
        price: 89.99,
        stock: 22,
        images: [
          "https://res.cloudinary.com/dofsj68au/image/upload/v1759248871/shoes/pink_white_7.jpg",
        ],
      },
      {
        color: "Lavender/Mint",
        size: "7",
        sku: "FF-CC-LM-7",
        price: 89.99,
        stock: 15,
        images: [
          "https://res.cloudinary.com/dofsj68au/image/upload/v1759248871/shoes/lavender_mint_7.jpg",
        ],
      },
      {
        color: "Lavender/Mint",
        size: "8",
        sku: "FF-CC-LM-8",
        price: 89.99,
        stock: 20,
        images: [
          "https://res.cloudinary.com/dofsj68au/image/upload/v1759248871/shoes/lavender_mint_8.jpg",
        ],
      },
      {
        color: "Pearl Gray/Coral",
        size: "6.5",
        sku: "FF-CC-PG-6.5",
        price: 89.99,
        stock: 12,
        images: [
          "https://res.cloudinary.com/dofsj68au/image/upload/v1759248871/shoes/gray_coral_6.5.jpg",
        ],
      },
      {
        color: "Lavender/Mint",
        size: "7.5",
        sku: "FF-CC-PG-7.5",
        price: 89.99,
        stock: 14,
        images: [
          "https://res.cloudinary.com/dofsj68au/image/upload/v1759248871/shoes/gray_coral_7.5.jpg",
        ],
      },
    ],
    specifications: {
      upperMaterial: "Seamless Knit",
      midsole: "CloudTec Foam",
      outsole: "Durable Rubber",
      closure: "Lace-up",
      weight: "220g (size 7)",
      drop: "8mm",
      suitableFor: "Road Running, Gym, Casual",
      waterResistant: "No",
      technology: "Cloud Cushioning, Breathable",
      support: "Neutral",
      width: "Standard (B)",
    },
    features: [
      "CloudTec Cushioning",
      "Seamless Knit Upper",
      "Lightweight Design",
      "Women-Specific Fit",
      "Breathable Material",
      "Reflective Accents",
      "Enhanced Comfort",
      "Style & Performance",
    ],
    tags: [
      "women-shoes",
      "running-shoes",
      "athletic",
      "workout",
      "comfort",
      "pink",
      "lavender",
      "fitness",
    ],
    offers: {
      discountPercentage: 25,
      isOnSale: true,
      saleEndDate: "2024-12-15T23:59:59.000Z",
      freeShipping: true,
    },
    shipping: {
      weight: 0.5,
      dimensions: {
        length: 32,
        width: 20,
        height: 12,
      },
      freeShippingEligible: true,
      shippingCost: 0,
    },
    company: {
      name: "FitFemme Activewear",
      description:
        "Specialized in women's athletic footwear and apparel, focusing on style, comfort, and performance",
      contactEmail: "support@fitfemme.com",
      website: "https://fitfemme.com",
      logo: "https://res.cloudinary.com/dofsj68au/image/upload/v1759248871/shoes/fitfemme_logo.png",
      aboutPdf:
        "https://res.cloudinary.com/dofsj68au/raw/upload/v1759248871/shoes/fitfemme_technology.pdf",
    },
    productDocuments: [
      {
        name: "Women's Size Guide",
        type: "size-chart",
        fileUrl:
          "https://res.cloudinary.com/dofsj68au/raw/upload/v1759248871/shoes/women_shoe_size_guide.pdf",
        fileSize: 1600,
      },
      {
        name: "Care Instructions",
        type: "manual",
        fileUrl:
          "https://res.cloudinary.com/dofsj68au/raw/upload/v1759248871/shoes/shoe_care_instructions.pdf",
        fileSize: 1100,
      },
      {
        name: "Technology Features",
        type: "specification",
        fileUrl:
          "https://res.cloudinary.com/dofsj68au/raw/upload/v1759248871/shoes/cloudtec_technology.pdf",
        fileSize: 2400,
      },
    ],
    reviews: [
      {
        id: "68f4e55228a3a78637a88457",
        author: "devindaishan98@gmail.com",
        rating: 2,
        date: "2025-10-19",
        comment: "The camera quality is amazing and battery life is great.",
        helpful: 0,
        verifiedPurchase: true,
      },
    ],
  };

  // Get available colors and sizes from variants
  const availableColors = [...new Set(product.variants.map((v) => v.color))];
  const availableSizes = product.variants
    .filter((v) => v.color === selectedColor)
    .map((v) => v.size);

  // Get current variant based on selected color and size
  const currentVariant = product.variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  );

  const handleAddToCart = () => {
    message.success(`Added ${quantity} item(s) to cart!`);
  };

  const handleBuyNow = () => {
    message.info("Proceeding to checkout...");
  };

  // Combine all media (images + videos)
  const allMedia = [...product.images, ...product.videos];

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Row gutter={[48, 48]}>
          {/* Left Side - Images */}
          <Col xs={24} md={12}>
            <div className="sticky top-4">
              {/* Main Image */}
              <div className="relative mb-4 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
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
                        className={`object-contain transition-transform ${
                          isZoomed
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
                    className={`relative h-20 w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-md border-2 ${
                      selectedImage === idx
                        ? "border-blue-500"
                        : "border-gray-200"
                    }`}
                    onClick={() => setSelectedImage(idx)}
                  >
                    {media.type === "video" ? (
                      <div className="flex h-full items-center justify-center bg-gray-100">
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
              <Button
                block
                size="large"
                className="mt-4"
                icon={<span className="mr-2">🔄</span>}
                onClick={() => {
                  // Show 360 view images
                  const mediaWith360 = [...product.image360];
                  setSelectedImage(0);
                }}
              >
                View 360° Product Tour
              </Button>
            </div>
          </Col>

          {/* Right Side - Product Details */}
          <Col xs={24} md={12}>
            <div className="space-y-6">
              {/* Brand & Title */}
              <div>
                <Tag color="pink">{product.brand}</Tag>
                <h1 className="mt-2 text-3xl font-bold text-gray-900">
                  {product.name}
                </h1>
                <p className="mt-2 text-sm text-gray-500">
                  SKU: {currentVariant?.sku || product.variants[0]?.sku}
                </p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4">
                <Rate disabled defaultValue={product.rating} allowHalf />
                <span className="text-sm text-gray-600">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>

              <Divider />

              {/* Price */}
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-gray-900">
                    ${product.salePrice}
                  </span>
                  <span className="text-xl text-gray-400 line-through">
                    ${product.basePrice}
                  </span>
                  <Tag color="red">
                    Save {product.offers.discountPercentage}%
                  </Tag>
                </div>
                {product.offers.freeShipping && (
                  <p className="mt-2 text-sm text-green-600">
                    ✓ Free Shipping Available
                  </p>
                )}
                <p className="mt-1 text-sm text-green-600">
                  ✓ In Stock ({currentVariant?.stock || product.stock}{" "}
                  available)
                </p>
                {product.offers.isOnSale && (
                  <p className="mt-1 text-sm text-orange-600">
                    🏃‍♀️ Sale ends:{" "}
                    {new Date(product.offers.saleEndDate).toLocaleDateString()}
                  </p>
                )}
              </div>

              <Divider />

              {/* Color Selection */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-900">
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

              {/* Size Selection */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-900">
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

              {/* Quantity */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-900">
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
                  className="h-14 bg-blue-600 text-lg font-semibold"
                  onClick={handleAddToCart}
                >
                  Add to Cart
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
                    icon={<HeartOutlined />}
                    size="large"
                    className="flex-1"
                  >
                    Add to Wishlist
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
              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="mb-3 font-semibold">Key Features:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {product.features.slice(0, 6).map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span className="text-green-500">✓</span>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
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
                    <h2 className="text-2xl font-bold">Product Description</h2>
                    <p className="mt-4 text-gray-700">{product.description}</p>
                    <h3 className="mt-6 text-xl font-semibold">
                      Key Features:
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {product.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                ),
              },
              {
                key: "2",
                label: "Specifications",
                children: (
                  <div className="py-6">
                    <h2 className="mb-6 text-2xl font-bold">
                      Technical Specifications
                    </h2>
                    <div className="space-y-4">
                      {Object.entries(product.specifications).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex border-b border-gray-200 pb-3"
                          >
                            <div className="w-1/3 font-semibold text-gray-700">
                              {key}
                            </div>
                            <div className="w-2/3 text-gray-600">{value}</div>
                          </div>
                        )
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
                    <div className="mb-8 rounded-lg bg-gray-50 p-6">
                      <Row gutter={48}>
                        <Col xs={24} md={8}>
                          <div className="text-center">
                            <div className="text-5xl font-bold">
                              {product.rating}
                            </div>
                            <Rate
                              disabled
                              defaultValue={product.rating}
                              allowHalf
                              className="my-2"
                            />
                            <div className="text-gray-600">
                              Based on {product.reviewCount} reviews
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-6">
                      {product.reviews.map((review) => (
                        <div
                          key={review.id}
                          className="border-b border-gray-200 pb-6"
                        >
                          <div className="flex items-start gap-4">
                            <Avatar size={48} className="bg-blue-500">
                              {review.author[0]}
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-semibold">
                                    {review.author}
                                  </h4>
                                  <Rate
                                    disabled
                                    defaultValue={review.rating}
                                    className="text-sm"
                                  />
                                  {review.verifiedPurchase && (
                                    <Tag color="green" className="ml-2">
                                      Verified Purchase
                                    </Tag>
                                  )}
                                </div>
                                <span className="text-sm text-gray-500">
                                  {review.date}
                                </span>
                              </div>
                              <p className="mt-2 text-gray-700">
                                {review.comment}
                              </p>
                              <Button type="link" className="mt-2 px-0">
                                Helpful ({review.helpful})
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              },
              {
                key: "4",
                label: "Company Details",
                children: (
                  <div className="py-6">
                    <h2 className="mb-6 text-2xl font-bold">
                      About {product.company.name}
                    </h2>
                    <div className="space-y-4">
                      <p className="text-gray-700">
                        {product.company.description}
                      </p>
                      <div className="flex items-center gap-4">
                        <Image
                          src={product.company.logo}
                          alt={`${product.company.name} logo`}
                          width={100}
                          height={60}
                          className="object-contain"
                        />
                        <div>
                          <p>
                            <strong>Email:</strong>{" "}
                            {product.company.contactEmail}
                          </p>
                          <p>
                            <strong>Website:</strong>{" "}
                            <a
                              href={product.company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600"
                            >
                              {product.company.website}
                            </a>
                          </p>
                        </div>
                      </div>
                      <Button
                        type="primary"
                        href={product.company.aboutPdf}
                        target="_blank"
                      >
                        Download Company Profile
                      </Button>
                    </div>
                  </div>
                ),
              },
              {
                key: "5",
                label: "Documents",
                children: (
                  <div className="py-6">
                    <h2 className="mb-6 text-2xl font-bold">
                      Product Documents
                    </h2>
                    <div className="space-y-3">
                      {product.productDocuments.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between border-b border-gray-200 pb-3"
                        >
                          <div>
                            <h4 className="font-semibold">{doc.name}</h4>
                            <p className="text-sm text-gray-600">
                              Type: {doc.type}
                            </p>
                          </div>
                          <Button
                            type="link"
                            href={doc.fileUrl}
                            target="_blank"
                          >
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
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
