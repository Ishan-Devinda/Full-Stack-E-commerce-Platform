const paymentService = require("../services/paymentService");
const stripe = require("../config/stripe");

class PaymentController {
  // Create checkout session
  async createCheckoutSession(req, res) {
    try {
      const { items, customerEmail, shippingAddress, metadata } = req.body;
      const userId = req.user._id;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Items are required",
        });
      }

      const sessionData = await paymentService.createCheckoutSession({
        userId,
        items,
        customerEmail,
        shippingAddress,
        metadata,
      });

      res.json({
        success: true,
        message: "Checkout session created successfully",
        data: sessionData,
      });
    } catch (error) {
      console.error("Create checkout session error:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Handle Stripe webhook
  async handleWebhook(req, res) {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      await paymentService.handleWebhook(event);
      res.json({ received: true });
    } catch (error) {
      console.error("Webhook handling error:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Verify payment
  async verifyPayment(req, res) {
    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: "Session ID is required",
        });
      }

      const verification = await paymentService.verifyPayment(sessionId);

      res.json({
        success: true,
        data: verification,
      });
    } catch (error) {
      console.error("Payment verification error:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Create refund
  async createRefund(req, res) {
    try {
      const { paymentIntentId, amount, reason } = req.body;

      if (!paymentIntentId) {
        return res.status(400).json({
          success: false,
          message: "Payment intent ID is required",
        });
      }

      const refund = await paymentService.createRefund(
        paymentIntentId,
        amount,
        reason
      );

      res.json({
        success: true,
        message: "Refund created successfully",
        data: refund,
      });
    } catch (error) {
      console.error("Refund creation error:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get user payment history
  async getPaymentHistory(req, res) {
    try {
      const userId = req.user._id;
      const { page = 1, limit = 10 } = req.query;

      const history = await paymentService.getPaymentHistory(
        userId,
        parseInt(page),
        parseInt(limit)
      );

      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      console.error("Get payment history error:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get all payments (admin)
  async getAllPayments(req, res) {
    try {
      const { page = 1, limit = 10, status, startDate, endDate } = req.query;

      const payments = await paymentService.getAllPayments(
        parseInt(page),
        parseInt(limit),
        { status, startDate, endDate }
      );

      res.json({
        success: true,
        data: payments,
      });
    } catch (error) {
      console.error("Get all payments error:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get payment by ID
  async getPaymentById(req, res) {
    try {
      const { paymentId } = req.params;

      const payment = await Payment.findOne({ paymentId }).populate(
        "userId",
        "username email"
      );

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }

      res.json({
        success: true,
        data: payment,
      });
    } catch (error) {
      console.error("Get payment by ID error:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new PaymentController();
