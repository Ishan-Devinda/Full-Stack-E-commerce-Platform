const Product = require("../models/Product");

class ProductService {
  // Create product
  async createProduct(productData) {
    try {
      // Ensure productDocuments is properly formatted
      if (
        productData.productDocuments &&
        !Array.isArray(productData.productDocuments)
      ) {
        throw new Error("productDocuments must be an array");
      }

      // Ensure specifications is properly formatted
      if (
        productData.specifications &&
        typeof productData.specifications !== "object"
      ) {
        throw new Error("specifications must be an object");
      }

      // Convert specifications object to Map if needed
      if (
        productData.specifications &&
        !(productData.specifications instanceof Map)
      ) {
        productData.specifications = new Map(
          Object.entries(productData.specifications)
        );
      }

      const product = new Product(productData);
      await product.save();

      return {
        success: true,
        message: "Product created successfully",
        data: product,
      };
    } catch (error) {
      console.error("Product creation error details:", error);
      throw new Error(`Product creation failed: ${error.message}`);
    }
  }
  // Get all products with advanced filtering
  async getAllProducts(filters = {}) {
    try {
      const {
        page = 1,
        limit = 12,
        search = "",
        category,
        subcategory,
        brand,
        minPrice,
        maxPrice,
        minRating,
        sortBy = "createdAt",
        sortOrder = "desc",
        inStock,
        onSale,
      } = filters;

      const skip = (page - 1) * limit;
      const query = { status: "active" };

      // Search functionality
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { brand: { $regex: search, $options: "i" } },
          { tags: { $in: [new RegExp(search, "i")] } },
        ];
      }

      // Filter by category
      if (category) {
        query.category = category;
      }

      // Filter by subcategory
      if (subcategory) {
        query.subcategory = subcategory;
      }

      // Filter by brand
      if (brand) {
        query.brand = brand;
      }

      // Price range filter
      const priceQuery = {};
      if (minPrice) priceQuery.$gte = parseFloat(minPrice);
      if (maxPrice) priceQuery.$lte = parseFloat(maxPrice);

      if (Object.keys(priceQuery).length > 0) {
        query.basePrice = priceQuery;
      }

      // Rating filter
      if (minRating) {
        query.averageRating = { $gte: parseFloat(minRating) };
      }

      // Stock filter
      if (inStock !== undefined) {
        if (inStock === "true") {
          query.stock = { $gt: 0 };
        } else {
          query.stock = { $lte: 0 };
        }
      }

      // Sale filter
      if (onSale === "true") {
        query["offers.isOnSale"] = true;
      }

      // Sort options
      const sortOptions = {};
      const validSortFields = [
        "name",
        "basePrice",
        "averageRating",
        "createdAt",
        "updatedAt",
      ];
      const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
      sortOptions[sortField] = sortOrder === "desc" ? -1 : 1;

      const products = await Product.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .select("-reviews -description -specifications -productDocuments");

      const total = await Product.countDocuments(query);

      // Get aggregation data for filters
      const aggregation = await Product.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            brands: { $addToSet: "$brand" },
            categories: { $addToSet: "$category" },
            subcategories: { $addToSet: "$subcategory" },
            minPrice: { $min: "$basePrice" },
            maxPrice: { $max: "$basePrice" },
          },
        },
      ]);

      const filterData = aggregation[0] || {
        brands: [],
        categories: [],
        subcategories: [],
        minPrice: 0,
        maxPrice: 0,
      };

      return {
        success: true,
        data: {
          products,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalProducts: total,
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1,
          },
          filters: {
            brands: filterData.brands || [],
            categories: filterData.categories || [],
            subcategories: filterData.subcategories || [],
            priceRange: {
              min: filterData.minPrice || 0,
              max: filterData.maxPrice || 0,
            },
          },
        },
      };
    } catch (error) {
      throw new Error(`Fetching products failed: ${error.message}`);
    }
  }

  // Get product by ID with full details
  async getProductById(productId) {
    try {
      const product = await Product.findById(productId).populate(
        "reviews.user",
        "name email"
      );

      if (!product || product.status !== "active") {
        throw new Error("Product not found");
      }

      return {
        success: true,
        data: product,
      };
    } catch (error) {
      throw new Error(`Fetching product failed: ${error.message}`);
    }
  }

  // Get product by slug
  async getProductBySlug(slug) {
    try {
      const product = await Product.findOne({
        "seo.slug": slug,
        status: "active",
      }).populate("reviews.user", "name email avatar");

      if (!product) {
        throw new Error("Product not found");
      }

      return {
        success: true,
        data: product,
      };
    } catch (error) {
      throw new Error(`Fetching product failed: ${error.message}`);
    }
  }

  // Update product
  async updateProduct(productId, updateData) {
    try {
      const product = await Product.findByIdAndUpdate(productId, updateData, {
        new: true,
        runValidators: true,
      });

      if (!product) {
        throw new Error("Product not found");
      }

      return {
        success: true,
        message: "Product updated successfully",
        data: product,
      };
    } catch (error) {
      throw new Error(`Product update failed: ${error.message}`);
    }
  }

  // Delete product (soft delete)
  async deleteProduct(productId) {
    try {
      const product = await Product.findByIdAndUpdate(
        productId,
        { status: "inactive" },
        { new: true }
      );

      if (!product) {
        throw new Error("Product not found");
      }

      return {
        success: true,
        message: "Product deleted successfully",
      };
    } catch (error) {
      throw new Error(`Product deletion failed: ${error.message}`);
    }
  }

  // Get products by IDs (for payment service)
  async getProductsByIds(productIds) {
    try {
      const products = await Product.find({
        _id: { $in: productIds },
        status: "active",
      });

      return products;
    } catch (error) {
      throw new Error(`Fetching products by IDs failed: ${error.message}`);
    }
  }

  // Update product stock (for payment service)
  async updateProductStock(productId, quantity, variantId = null) {
    try {
      let updateQuery;

      if (variantId) {
        // Update variant stock
        updateQuery = {
          $inc: { "variants.$[elem].stock": -quantity },
        };

        const product = await Product.findByIdAndUpdate(
          productId,
          updateQuery,
          {
            new: true,
            arrayFilters: [{ "elem._id": variantId }],
          }
        );

        if (!product) {
          throw new Error("Product or variant not found");
        }

        return product;
      } else {
        // Update main product stock
        const product = await Product.findByIdAndUpdate(
          productId,
          { $inc: { stock: -quantity } },
          { new: true }
        );

        if (!product) {
          throw new Error("Product not found");
        }

        return product;
      }
    } catch (error) {
      throw new Error(`Stock update failed: ${error.message}`);
    }
  }

  // Add review to product
  async addReview(productId, reviewData) {
    try {
      const product = await Product.findById(productId);

      if (!product) {
        throw new Error("Product not found");
      }

      product.reviews.push(reviewData);
      await product.save();

      return {
        success: true,
        message: "Review added successfully",
        data: product,
      };
    } catch (error) {
      throw new Error(`Adding review failed: ${error.message}`);
    }
  }

  // Get categories and subcategories
  async getCategories() {
    try {
      const categories = await Product.aggregate([
        { $match: { status: "active" } },
        {
          $group: {
            _id: "$category",
            subcategories: { $addToSet: "$subcategory" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      return {
        success: true,
        data: categories,
      };
    } catch (error) {
      throw new Error(`Fetching categories failed: ${error.message}`);
    }
  }

  // Search products with auto-suggestions
  async searchProducts(searchTerm, limit = 5) {
    try {
      const products = await Product.find({
        status: "active",
        $or: [
          { name: { $regex: searchTerm, $options: "i" } },
          { brand: { $regex: searchTerm, $options: "i" } },
          { tags: { $in: [new RegExp(searchTerm, "i")] } },
        ],
      })
        .select("name brand images basePrice salePrice offers")
        .limit(limit);

      return {
        success: true,
        data: products,
      };
    } catch (error) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  // Get hero products with high discounts (50% or more)
  async getHeroProducts(limit = 10) {
    try {
      const products = await Product.find({
        status: "active",
        "offers.discountPercentage": { $gte: 50 },
        "offers.isOnSale": true,
        stock: { $gt: 0 },
      })
        .select("name images basePrice salePrice offers _id category brand")
        .sort({ "offers.discountPercentage": -1 })
        .limit(parseInt(limit));

      return {
        success: true,
        data: products,
      };
    } catch (error) {
      throw new Error(`Fetching hero products failed: ${error.message}`);
    }
  }
}

module.exports = new ProductService();
