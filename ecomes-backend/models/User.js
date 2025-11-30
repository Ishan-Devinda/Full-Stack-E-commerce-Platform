const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
  size: String,
  color: String,
  customization: mongoose.Schema.Types.Mixed,
});

const addressSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["home", "work", "other"],
    default: "home",
  },
  name: {
    type: String,
    required: true,
  },
  line1: {
    type: String,
    required: true,
  },
  line2: String,
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  postal_code: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
    default: "US",
  },
  phone: String,
  isDefault: {
    type: Boolean,
    default: false,
  },
});

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
    },

    // PROFILE FIELDS
    profile: {
      firstName: String,
      lastName: String,
      phone: String,
      dateOfBirth: Date,
      gender: {
        type: String,
        enum: ["male", "female", "other", "prefer-not-to-say"],
      },
      bio: {
        type: String,
        maxlength: 500,
      },
      avatar: {
        publicId: String,
        url: String,
      },
      preferences: {
        newsletter: {
          type: Boolean,
          default: true,
        },
        notifications: {
          type: Boolean,
          default: true,
        },
        currency: {
          type: String,
          default: "USD",
        },
        language: {
          type: String,
          default: "en",
        },
      },
    },

    // ADDRESSES
    addresses: [addressSchema],

    // WISHLIST
    wishlist: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // SHOPPING CART
    cart: {
      items: [cartItemSchema],
      totalItems: {
        type: Number,
        default: 0,
      },
      totalAmount: {
        type: Number,
        default: 0,
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },

    // ORDER HISTORY (References to Order model)
    orders: [
      {
        orderId: {
          type: String,
          ref: "Order",
        },
        orderDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // PAYMENT METHODS (Stripe customer ID)
    stripeCustomerId: String,

    // AUTHENTICATION FIELDS
    googleId: {
      type: String,
      sparse: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      code: String,
      expiresAt: Date,
    },
    refreshTokens: [
      {
        token: String,
        expiresAt: Date,
      },
    ],

    // PASSWORD RESET AND EMAIL CHANGE
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpires: {
      type: Date,
      default: null,
    },
    emailChangeToken: {
      type: String,
      default: null,
    },
    newEmail: {
      type: String,
      default: null,
    },
    emailChangeTokenExpires: {
      type: Date,
      default: null,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update cart totals before saving
userSchema.pre("save", function (next) {
  if (this.isModified("cart.items")) {
    this.cart.totalItems = this.cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );
    this.cart.lastUpdated = new Date();
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate OTP
userSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  this.otp = {
    code: otp,
    expiresAt: expiresAt,
  };

  return otp;
};

// Verify OTP
userSchema.methods.verifyOTP = function (enteredOTP) {
  if (!this.otp || !this.otp.code) return false;

  const isExpired = new Date() > this.otp.expiresAt;
  if (isExpired) return false;

  return this.otp.code === enteredOTP;
};

// Cart methods
userSchema.methods.addToCart = function (
  productId,
  quantity = 1,
  options = {}
) {
  const existingItem = this.cart.items.find(
    (item) => item.productId.toString() === productId.toString()
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.cart.items.push({
      productId,
      quantity,
      ...options,
    });
  }

  this.cart.totalItems = this.cart.items.reduce(
    (total, item) => total + item.quantity,
    0
  );
  return this.save();
};

userSchema.methods.removeFromCart = function (productId) {
  this.cart.items = this.cart.items.filter(
    (item) => item.productId.toString() !== productId.toString()
  );
  this.cart.totalItems = this.cart.items.reduce(
    (total, item) => total + item.quantity,
    0
  );
  return this.save();
};

userSchema.methods.updateCartQuantity = function (productId, quantity) {
  const item = this.cart.items.find(
    (item) => item.productId.toString() === productId.toString()
  );

  if (item) {
    if (quantity <= 0) {
      return this.removeFromCart(productId);
    }
    item.quantity = quantity;
    this.cart.totalItems = this.cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );
    return this.save();
  }
  return Promise.resolve(this);
};

userSchema.methods.clearCart = function () {
  this.cart.items = [];
  this.cart.totalItems = 0;
  return this.save();
};

// Wishlist methods
userSchema.methods.addToWishlist = function (productId) {
  if (
    !this.wishlist.some(
      (item) => item.productId.toString() === productId.toString()
    )
  ) {
    this.wishlist.push({ productId });
    return this.save();
  }
  return Promise.resolve(this);
};

userSchema.methods.removeFromWishlist = function (productId) {
  this.wishlist = this.wishlist.filter(
    (item) => item.productId.toString() !== productId.toString()
  );
  return this.save();
};

userSchema.methods.isInWishlist = function (productId) {
  return this.wishlist.some(
    (item) => item.productId.toString() === productId.toString()
  );
};

// Address methods
userSchema.methods.addAddress = function (addressData) {
  // If this is the first address or marked as default, set as default
  if (this.addresses.length === 0 || addressData.isDefault) {
    addressData.isDefault = true;
    // Remove default from other addresses
    this.addresses.forEach((addr) => (addr.isDefault = false));
  }

  this.addresses.push(addressData);
  return this.save();
};

userSchema.methods.setDefaultAddress = function (addressId) {
  this.addresses.forEach((addr) => {
    addr.isDefault = addr._id.toString() === addressId.toString();
  });
  return this.save();
};

userSchema.methods.removeAddress = function (addressId) {
  this.addresses = this.addresses.filter(
    (addr) => addr._id.toString() !== addressId.toString()
  );

  // If we removed the default address and there are other addresses, set first as default
  if (
    this.addresses.length > 0 &&
    !this.addresses.some((addr) => addr.isDefault)
  ) {
    this.addresses[0].isDefault = true;
  }

  return this.save();
};

module.exports = mongoose.model("User", userSchema);
