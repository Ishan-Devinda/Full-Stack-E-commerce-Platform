const express = require("express");
const { body, validationResult } = require("express-validator");
const { adminAuth } = require("../middleware/adminAuth");
const productController = require("../controllers/productController");
const { auth } = require("../middleware/auth");

const router = express.Router();

// Validation middleware
const validateProduct = [
  body("name").notEmpty().withMessage("Product name is required"),
  body("description").notEmpty().withMessage("Product description is required"),
  body("category").notEmpty().withMessage("Category is required"),
  body("subcategory").notEmpty().withMessage("Subcategory is required"),
  body("brand").notEmpty().withMessage("Brand is required"),
  body("basePrice").isNumeric().withMessage("Base price must be a number"),
  body("stock")
    .isInt({ min: 0 })
    .withMessage("Stock must be a positive integer"),
];

const validateReview = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment").optional().isString(),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Public routes - IMPORTANT: Specific routes must come before parameterized routes
router.get("/", (req, res) => productController.getAllProducts(req, res));
router.get("/categories", (req, res) =>
  productController.getCategories(req, res)
);
router.get("/search", (req, res) => productController.searchProducts(req, res));
router.get("/hero", (req, res) => productController.getHeroProducts(req, res));
router.get("/slug/:slug", (req, res) =>
  productController.getProductBySlug(req, res)
);
// This must be last among GET routes as it's a catch-all for any ID
router.get("/:id", (req, res) => productController.getProductById(req, res));

// Protected routes (authenticated users)
router.post(
  "/:id/reviews",
  auth,
  validateReview,
  handleValidationErrors,
  (req, res) => productController.addReview(req, res)
);

// Admin only routes
router.post(
  "/",
  auth,
  adminAuth,
  validateProduct,
  handleValidationErrors,
  (req, res) => productController.createProduct(req, res)
);

router.put("/:id", auth, adminAuth, (req, res) =>
  productController.updateProduct(req, res)
);

router.delete("/:id", auth, adminAuth, (req, res) =>
  productController.deleteProduct(req, res)
);

module.exports = router;
