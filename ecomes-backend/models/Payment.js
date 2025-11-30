const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      unique: true,
      required: true, // keep required
    },
    orderId: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "usd",
    },
    status: {
      type: String,
      enum: ["pending", "succeeded", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: String,
    stripePaymentIntentId: {
      type: String,
      required: true,
    },
    stripeCustomerId: String,
    receiptUrl: String,
    billingDetails: {
      name: String,
      email: String,
      phone: String,
      address: {
        line1: String,
        line2: String,
        city: String,
        state: String,
        postal_code: String,
        country: String,
      },
    },
    refunds: [
      {
        refundId: String,
        amount: Number,
        reason: String,
        status: String,
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

// ✅ Generate payment ID before validation
paymentSchema.pre("validate", function (next) {
  if (!this.paymentId) {
    this.paymentId =
      "PAY_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  }
  next();
});

module.exports = mongoose.model("Payment", paymentSchema);
