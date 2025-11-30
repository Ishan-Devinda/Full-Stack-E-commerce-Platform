const productService = require("../services/productService");

class ProductController {
  // Create product
  async createProduct(req, res) {
    try {
      const result = await productService.createProduct(req.body);
      res.status(201).json(result);
    } catch (error) {
      console.error("Create product error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Server error creating product",
      });
    }
  }

  // Get all products with filters
  async getAllProducts(req, res) {
    try {
      const result = await productService.getAllProducts(req.query);
      res.json(result);
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Server error fetching products",
      });
    }
  }

  // Get product by ID
  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const result = await productService.getProductById(id);
      res.json(result);
    } catch (error) {
      console.error("Get product error:", error);

      if (error.message === "Product not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || "Server error fetching product",
      });
    }
  }

  // Get product by slug
  async getProductBySlug(req, res) {
    try {
      const { slug } = req.params;
      const result = await productService.getProductBySlug(slug);
      res.json(result);
    } catch (error) {
      console.error("Get product by slug error:", error);

      if (error.message === "Product not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || "Server error fetching product",
      });
    }
  }

  // Update product
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const result = await productService.updateProduct(id, req.body);
      res.json(result);
    } catch (error) {
      console.error("Update product error:", error);

      if (error.message === "Product not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || "Server error updating product",
      });
    }
  }

  // Delete product
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const result = await productService.deleteProduct(id);
      res.json(result);
    } catch (error) {
      console.error("Delete product error:", error);

      if (error.message === "Product not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || "Server error deleting product",
      });
    }
  }

  // Add review
  async addReview(req, res) {
    try {
      const { id } = req.params;
      const reviewData = {
        ...req.body,
        user: req.user.id, // Assuming user is authenticated
      };

      const result = await productService.addReview(id, reviewData);
      res.status(201).json(result);
    } catch (error) {
      console.error("Add review error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Server error adding review",
      });
    }
  }

  // Get categories
  async getCategories(req, res) {
    try {
      const result = await productService.getCategories();
      res.json(result);
    } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Server error fetching categories",
      });
    }
  }

  // Search products (for auto-suggestions)
  async searchProducts(req, res) {
    try {
      const { q, limit } = req.query;
      const result = await productService.searchProducts(q, limit);
      res.json(result);
    } catch (error) {
      console.error("Search products error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Server error searching products",
      });
    }
  }
}

module.exports = new ProductController();
