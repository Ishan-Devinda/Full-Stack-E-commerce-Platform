const express = require("express");
const { auth } = require("../middleware/auth");
const { adminAuth } = require("../middleware/adminAuth");
const paymentController = require("../controllers/paymentController");

const router = express.Router();

// Webhook endpoint (no auth needed - Stripe calls this directly)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleWebhook
);

// Regular routes (use JSON parser)
router.use(express.json());

// Create checkout session
router.post(
  "/create-checkout-session",
  auth,
  paymentController.createCheckoutSession
);

// Verify payment
router.post("/verify", auth, paymentController.verifyPayment);

// Create refund
router.post("/refund", paymentController.createRefund);

// Get user payment history
router.get("/history", auth, paymentController.getPaymentHistory);

// Get all payments (admin only)
router.get("/admin/all", auth, adminAuth, paymentController.getAllPayments);

// Get payment by ID
router.get("/:paymentId", auth, paymentController.getPaymentById);

module.exports = router;
