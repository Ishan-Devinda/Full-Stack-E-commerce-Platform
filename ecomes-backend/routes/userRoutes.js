const express = require("express");
const { auth } = require("../middleware/auth");
const userController = require("../controllers/userController");

const router = express.Router();

// Profile routes
router.get("/profile", auth, (req, res) => userController.getProfile(req, res));
router.put("/profile", auth, (req, res) =>
  userController.updateProfile(req, res)
);
router.put("/profile/photo", auth, (req, res) =>
  userController.updateProfilePhoto(req, res)
);

// Wishlist routes
router.get("/wishlist", auth, (req, res) =>
  userController.getWishlist(req, res)
);
router.post("/wishlist", auth, (req, res) =>
  userController.addToWishlist(req, res)
);
router.delete("/wishlist/:productId", auth, (req, res) =>
  userController.removeFromWishlist(req, res)
);

// Cart routes
router.get("/cart", auth, (req, res) => userController.getCart(req, res));
router.post("/cart", auth, (req, res) => userController.addToCart(req, res));
router.put("/cart/:productId", auth, (req, res) =>
  userController.updateCartQuantity(req, res)
);
router.delete("/cart/:productId", auth, (req, res) =>
  userController.removeFromCart(req, res)
);
router.delete("/cart", auth, (req, res) => userController.clearCart(req, res));

// Address routes
router.get("/addresses", auth, (req, res) =>
  userController.getProfile(req, res)
); // Addresses are in profile
router.post("/addresses", auth, (req, res) =>
  userController.addAddress(req, res)
);
router.put("/addresses/:addressId", auth, (req, res) =>
  userController.updateAddress(req, res)
);
router.delete("/addresses/:addressId", auth, (req, res) =>
  userController.deleteAddress(req, res)
);
router.patch("/addresses/:addressId/default", auth, (req, res) =>
  userController.setDefaultAddress(req, res)
);

// Order history
router.get("/orders", auth, (req, res) =>
  userController.getOrderHistory(req, res)
);

module.exports = router;
