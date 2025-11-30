const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: String,
  price: Number,
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  image: String,
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "usd",
    },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "completed",
        "cancelled",
        "refunded",
        "failed",
      ],
      default: "pending",
    },
    shippingAddress: {
      name: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      postal_code: String,
      country: String,
    },
    customerEmail: String,
    stripePaymentIntentId: String,
    stripeCustomerId: String,
    paymentMethod: String,
    refunds: [
      {
        amount: Number,
        reason: String,
        status: String,
        stripeRefundId: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    metadata: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Generate order ID
orderSchema.pre("save", function (next) {
  if (!this.orderId) {
    this.orderId =
      "ORD_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
