const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: String,
    comment: String,
    images: [String],
    verifiedPurchase: {
      type: Boolean,
      default: false,
    },
    helpful: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const productVariantSchema = new mongoose.Schema({
  color: String,
  size: String,
  sku: String,
  price: Number,
  stock: {
    type: Number,
    default: 0,
  },
  images: [String],
});

const productDocumentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    default: 0,
  },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "electronics",
        "clothing",
        "shoes",
        "furniture",
        "home-appliances",
        "phones",
        "laptops",
        "accessories",
        "jewelry-watches",
      ],
      index: true,
    },
    subcategory: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    salePrice: {
      type: Number,
      min: 0,
      validate: {
        validator: function (value) {
          // FIXED: Sale price should be LOWER than base price, not higher
          if (value && this.basePrice) {
            return value <= this.basePrice;
          }
          return true;
        },
        message: "Sale price cannot be higher than base price",
      },
    },
    currency: {
      type: String,
      default: "USD",
      uppercase: true,
    },
    images: [
      {
        type: String,
        validate: {
          validator: function (v) {
            return /^https?:\/\/.+\..+/.test(v);
          },
          message: "Invalid image URL",
        },
      },
    ],
    videos: [String],
    image360: [String],
    variants: [productVariantSchema],
    specifications: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    features: [String],
    tags: [String],
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: 0,
    },
    weight: {
      type: Number,
      min: 0,
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        default: "cm",
      },
    },
    reviews: [reviewSchema],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    offers: {
      discountPercentage: {
        type: Number,
        min: 0,
        max: 100,
      },
      isOnSale: {
        type: Boolean,
        default: false,
      },
      saleEndDate: Date,
      freeShipping: {
        type: Boolean,
        default: false,
      },
    },
    shipping: {
      weight: Number,
      dimensions: {
        length: Number,
        width: Number,
        height: Number,
      },
      freeShippingEligible: {
        type: Boolean,
        default: false,
      },
      shippingCost: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    company: {
      name: String,
      description: String,
      contactEmail: {
        type: String,
        validate: {
          validator: function (v) {
            return /^\S+@\S+\.\S+$/.test(v);
          },
          message: "Invalid email format",
        },
      },
      website: String,
      logo: String,
      aboutPdf: String,
    },
    productDocuments: [productDocumentSchema],
    seo: {
      metaTitle: String,
      metaDescription: String,
      slug: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        lowercase: true,
      },
      keywords: [String],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "draft", "out-of-stock"],
      default: "active",
    },
    stripeProductId: String,
    stripePriceId: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ "reviews.rating": 1 });
productSchema.index({ basePrice: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ "seo.slug": 1 }, { unique: true, sparse: true });
productSchema.index({ brand: 1 });
productSchema.index({ status: 1 });

// Pre-save middleware to calculate average rating and generate slug
productSchema.pre("save", function (next) {
  // Calculate average rating
  if (this.reviews.length > 0) {
    const totalRating = this.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    this.averageRating =
      Math.round((totalRating / this.reviews.length) * 10) / 10;
    this.reviewCount = this.reviews.length;
  } else {
    this.averageRating = 0;
    this.reviewCount = 0;
  }

  // Generate slug if not provided
  if (!this.seo.slug && this.name) {
    this.seo.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  // Calculate discount percentage if sale price is set
  if (this.salePrice && this.basePrice && this.salePrice < this.basePrice) {
    this.offers.discountPercentage = Math.round(
      ((this.basePrice - this.salePrice) / this.basePrice) * 100
    );
    this.offers.isOnSale = true;
  } else if (this.salePrice && this.salePrice >= this.basePrice) {
    // If sale price is not actually a discount, don't mark as on sale
    this.offers.isOnSale = false;
    this.offers.discountPercentage = 0;
  }

  next();
});

module.exports = mongoose.model("Product", productSchema);
