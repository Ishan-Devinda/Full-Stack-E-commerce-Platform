const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const uploadService = require("../services/uploadService");

class UserController {
  // Get user profile
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user._id)
        .select("-password -refreshTokens -otp -resetToken -emailChangeToken")
        .populate("wishlist.productId", "name price images")
        .populate("cart.items.productId", "name price images stock");

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch profile",
      });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const {
        firstName,
        lastName,
        phone,
        dateOfBirth,
        gender,
        bio,
        preferences,
      } = req.body;

      const updateData = {};
      if (firstName) updateData["profile.firstName"] = firstName;
      if (lastName) updateData["profile.lastName"] = lastName;
      if (phone) updateData["profile.phone"] = phone;
      if (dateOfBirth) updateData["profile.dateOfBirth"] = dateOfBirth;
      if (gender) updateData["profile.gender"] = gender;
      if (bio) updateData["profile.bio"] = bio;
      if (preferences) updateData["profile.preferences"] = preferences;

      const user = await User.findByIdAndUpdate(req.user._id, updateData, {
        new: true,
        runValidators: true,
      }).select("-password -refreshTokens -otp -resetToken -emailChangeToken");

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: user,
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update profile",
      });
    }
  }

  // Update profile photo
  async updateProfilePhoto(req, res) {
    try {
      const { publicId, url } = req.body;

      if (!publicId || !url) {
        return res.status(400).json({
          success: false,
          message: "Public ID and URL are required",
        });
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        {
          "profile.avatar": {
            publicId,
            url,
          },
        },
        { new: true }
      ).select("-password -refreshTokens -otp -resetToken -emailChangeToken");

      res.json({
        success: true,
        message: "Profile photo updated successfully",
        data: user,
      });
    } catch (error) {
      console.error("Update profile photo error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update profile photo",
      });
    }
  }

  // Add to wishlist
  async addToWishlist(req, res) {
    try {
      const { productId } = req.body;

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: "Product ID is required",
        });
      }

      // Check if product exists
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      const user = await User.findById(req.user._id);
      await user.addToWishlist(productId);

      res.json({
        success: true,
        message: "Product added to wishlist",
        data: { wishlist: user.wishlist },
      });
    } catch (error) {
      console.error("Add to wishlist error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add to wishlist",
      });
    }
  }

  // Remove from wishlist
  async removeFromWishlist(req, res) {
    try {
      const { productId } = req.params;

      const user = await User.findById(req.user._id);
      await user.removeFromWishlist(productId);

      res.json({
        success: true,
        message: "Product removed from wishlist",
        data: { wishlist: user.wishlist },
      });
    } catch (error) {
      console.error("Remove from wishlist error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to remove from wishlist",
      });
    }
  }

  // Get wishlist
  async getWishlist(req, res) {
    try {
      const user = await User.findById(req.user._id).populate(
        "wishlist.productId",
        "name price images stock"
      );

      res.json({
        success: true,
        data: {
          wishlist: user.wishlist,
          totalItems: user.wishlist.length,
        },
      });
    } catch (error) {
      console.error("Get wishlist error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch wishlist",
      });
    }
  }

  // Add to cart
  async addToCart(req, res) {
    try {
      const { productId, quantity = 1, size, color, customization } = req.body;

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: "Product ID is required",
        });
      }

      // Check if product exists and has stock
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: "Insufficient stock",
        });
      }

      const user = await User.findById(req.user._id);
      await user.addToCart(productId, quantity, { size, color, customization });

      const updatedUser = await User.findById(req.user._id).populate(
        "cart.items.productId",
        "name price images stock"
      );

      res.json({
        success: true,
        message: "Product added to cart",
        data: {
          cart: updatedUser.cart,
        },
      });
    } catch (error) {
      console.error("Add to cart error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add to cart",
      });
    }
  }

  // Remove from cart
  async removeFromCart(req, res) {
    try {
      const { productId } = req.params;

      const user = await User.findById(req.user._id);
      await user.removeFromCart(productId);

      const updatedUser = await User.findById(req.user._id).populate(
        "cart.items.productId",
        "name price images stock"
      );

      res.json({
        success: true,
        message: "Product removed from cart",
        data: {
          cart: updatedUser.cart,
        },
      });
    } catch (error) {
      console.error("Remove from cart error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to remove from cart",
      });
    }
  }

  // Update cart quantity
  async updateCartQuantity(req, res) {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity < 0) {
        return res.status(400).json({
          success: false,
          message: "Valid quantity is required",
        });
      }

      const user = await User.findById(req.user._id);
      await user.updateCartQuantity(productId, parseInt(quantity));

      const updatedUser = await User.findById(req.user._id).populate(
        "cart.items.productId",
        "name price images stock"
      );

      res.json({
        success: true,
        message: "Cart updated successfully",
        data: {
          cart: updatedUser.cart,
        },
      });
    } catch (error) {
      console.error("Update cart quantity error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update cart",
      });
    }
  }

  // Get cart
  async getCart(req, res) {
    try {
      const user = await User.findById(req.user._id).populate(
        "cart.items.productId",
        "name salePrice basePrice images stock offers"
      );

      // Calculate prices with discounts
      let totalAmount = 0;
      const cartWithPrices = user.cart.items.map((item) => {
        if (!item.productId) return null;

        // Calculate unit price (salePrice or basePrice)
        const unitPrice = item.productId.salePrice || item.productId.basePrice;

        // Validate price - skip items with invalid prices
        if (!unitPrice || unitPrice <= 0) {
          console.warn(`Product ${item.productId.name} has invalid price, skipping from cart`);
          return null;
        }

        // Apply discount if offers exist
        let finalPrice = unitPrice;
        if (item.productId.offers && item.productId.offers.discountPercentage > 0) {
          const discount = (unitPrice * item.productId.offers.discountPercentage) / 100;
          finalPrice = unitPrice - discount;
        }

        const itemTotal = finalPrice * item.quantity;
        totalAmount += itemTotal;

        return {
          ...item.toObject(),
          unitPrice: finalPrice,
          originalPrice: unitPrice,
          total: itemTotal,
          discount: item.productId.offers?.discountPercentage || 0
        };
      }).filter(Boolean);

      res.json({
        success: true,
        data: {
          cart: {
            ...user.cart.toObject(),
            items: cartWithPrices
          },
          totalAmount: totalAmount,
        },
      });
    } catch (error) {
      console.error("Get cart error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch cart",
      });
    }
  }

  // Clear cart
  async clearCart(req, res) {
    try {
      const user = await User.findById(req.user._id);
      await user.clearCart();

      res.json({
        success: true,
        message: "Cart cleared successfully",
        data: {
          cart: user.cart,
        },
      });
    } catch (error) {
      console.error("Clear cart error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to clear cart",
      });
    }
  }

  // Add address
  async addAddress(req, res) {
    try {
      const addressData = req.body;

      const user = await User.findById(req.user._id);
      await user.addAddress(addressData);

      res.json({
        success: true,
        message: "Address added successfully",
        data: {
          addresses: user.addresses,
        },
      });
    } catch (error) {
      console.error("Add address error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add address",
      });
    }
  }

  // Update address
  async updateAddress(req, res) {
    try {
      const { addressId } = req.params;
      const addressData = req.body;

      const user = await User.findById(req.user._id);
      const addressIndex = user.addresses.findIndex(
        (addr) => addr._id.toString() === addressId
      );

      if (addressIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "Address not found",
        });
      }

      // Handle default address logic
      if (addressData.isDefault) {
        user.addresses.forEach((addr) => {
          addr.isDefault = addr._id.toString() === addressId;
        });
      }

      user.addresses[addressIndex] = {
        ...user.addresses[addressIndex].toObject(),
        ...addressData,
      };

      await user.save();

      res.json({
        success: true,
        message: "Address updated successfully",
        data: {
          addresses: user.addresses,
        },
      });
    } catch (error) {
      console.error("Update address error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update address",
      });
    }
  }

  // Delete address
  async deleteAddress(req, res) {
    try {
      const { addressId } = req.params;

      const user = await User.findById(req.user._id);
      await user.removeAddress(addressId);

      res.json({
        success: true,
        message: "Address deleted successfully",
        data: {
          addresses: user.addresses,
        },
      });
    } catch (error) {
      console.error("Delete address error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete address",
      });
    }
  }

  // Set default address
  async setDefaultAddress(req, res) {
    try {
      const { addressId } = req.params;

      const user = await User.findById(req.user._id);
      await user.setDefaultAddress(addressId);

      res.json({
        success: true,
        message: "Default address updated successfully",
        data: {
          addresses: user.addresses,
        },
      });
    } catch (error) {
      console.error("Set default address error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to set default address",
      });
    }
  }

  // Get order history
  async getOrderHistory(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const orders = await Order.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate("items.productId", "name images");

      const total = await Order.countDocuments({ userId: req.user._id });

      res.json({
        success: true,
        data: {
          orders,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalOrders: total,
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1,
          },
        },
      });
    } catch (error) {
      console.error("Get order history error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch order history",
      });
    }
  }
}

module.exports = new UserController();
