const stripe = require("../config/stripe");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const Product = require("../models/Product");
const productService = require("./productService");

class PaymentService {
  // Create Stripe Checkout Session
  async createCheckoutSession(orderData) {
    try {
      const { userId, items, customerEmail, shippingAddress, metadata } =
        orderData;

      const lineItems = [];
      let totalAmount = 0;

      for (const item of items) {
        const products = await productService.getProductsByIds([
          item.productId,
        ]);
        const product = products[0];
        if (!product) throw new Error(`Product not found: ${item.productId}`);
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product: ${product.name}`);
        }

        totalAmount += product.price * item.quantity;

        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
              description: product.description,
              images: product.images,
              metadata: { productId: product._id.toString() },
            },
            unit_amount: Math.round(product.price * 100), // cents
          },
          quantity: item.quantity,
        });
      }

      const orderId =
        "ORD_" +
        Date.now() +
        "_" +
        Math.random().toString(36).substr(2, 9).toUpperCase();

      // Save Order
      const order = new Order({
        orderId,
        userId,
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        totalAmount,
        currency: "usd",
        customerEmail,
        shippingAddress,
        metadata,
      });

      await order.save();

      // Create Stripe session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
        customer_email: customerEmail,
        client_reference_id: order.orderId,
        metadata: { orderId: order.orderId, userId: userId.toString() },
        shipping_address_collection: {
          allowed_countries: ["US", "CA", "GB", "AU", "IN"],
        },
        billing_address_collection: "required",
      });

      return {
        sessionId: session.id,
        url: session.url,
        orderId: order.orderId,
      };
    } catch (error) {
      throw new Error(`Checkout session creation failed: ${error.message}`);
    }
  }

  // Handle Webhook Events
  async handleWebhook(event) {
    try {
      switch (event.type) {
        case "checkout.session.completed":
          await this.handleCheckoutSessionCompleted(event.data.object);
          break;
        case "payment_intent.succeeded":
          await this.handlePaymentIntentSucceeded(event.data.object);
          break;
        case "payment_intent.payment_failed":
          await this.handlePaymentIntentFailed(event.data.object);
          break;
        case "charge.refunded":
          await this.handleChargeRefunded(event.data.object);
          break;
      }
    } catch (error) {
      throw new Error(`Webhook handling failed: ${error.message}`);
    }
  }

  // Checkout completed → Save Payment
  async handleCheckoutSessionCompleted(session) {
    const orderId = session.metadata.orderId;
    const userId = session.metadata.userId;

    const order = await Order.findOne({ orderId });
    if (!order) throw new Error(`Order not found: ${orderId}`);

    let stripePaymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;

    if (!stripePaymentIntentId)
      throw new Error("Payment intent ID not found in session");

    // Update Order
    order.status = "processing";
    order.stripePaymentIntentId = stripePaymentIntentId;
    order.stripeCustomerId = session.customer;
    await order.save();

    // Avoid duplicates
    const existingPayment = await Payment.findOne({ stripePaymentIntentId });
    if (!existingPayment) {
      const payment = new Payment({
        orderId: order.orderId,
        userId: order.userId,
        amount: session.amount_total / 100,
        currency: session.currency,
        status: "succeeded",
        stripePaymentIntentId,
        stripeCustomerId: session.customer,
        receiptUrl: session.payment_intent?.charges?.data?.[0]?.receipt_url,
        billingDetails: session.customer_details,
        metadata: session.metadata,
      });
      await payment.save();
    }

    // Update product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    console.log(`✅ Payment saved for order: ${orderId}`);
  }

  // Payment Intent succeeded
  async handlePaymentIntentSucceeded(paymentIntent) {
    const payment = await Payment.findOne({
      stripePaymentIntentId: paymentIntent.id,
    });
    if (payment) {
      payment.status = "succeeded";
      payment.receiptUrl = paymentIntent.charges.data[0]?.receipt_url;
      await payment.save();

      await Order.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntent.id },
        { status: "completed" }
      );
    }
  }

  // Payment failed
  async handlePaymentIntentFailed(paymentIntent) {
    const payment = await Payment.findOne({
      stripePaymentIntentId: paymentIntent.id,
    });
    if (payment) {
      payment.status = "failed";
      await payment.save();

      await Order.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntent.id },
        { status: "failed" }
      );
    }
  }

  // Refund handler
  async handleChargeRefunded(charge) {
    const payment = await Payment.findOne({
      stripePaymentIntentId: charge.payment_intent,
    });
    if (payment) {
      const refund = charge.refunds.data[0];
      payment.refunds.push({
        refundId: refund.id,
        amount: refund.amount / 100,
        reason: refund.reason,
        status: refund.status,
      });
      payment.status = "refunded";
      await payment.save();

      await Order.findOneAndUpdate(
        { stripePaymentIntentId: charge.payment_intent },
        {
          status: "refunded",
          $push: {
            refunds: {
              amount: refund.amount / 100,
              reason: refund.reason,
              status: refund.status,
              stripeRefundId: refund.id,
            },
          },
        }
      );
    }
  }

  // Create refund
  async createRefund(
    paymentIntentId,
    amount,
    reason = "requested_by_customer"
  ) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: Math.round(amount * 100),
        reason,
      });
      return refund;
    } catch (error) {
      throw new Error(`Refund creation failed: ${error.message}`);
    }
  }

  // Payment history
  async getPaymentHistory(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "username email");
    const total = await Payment.countDocuments({ userId });

    return {
      payments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPayments: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  // All payments (Admin)
  async getAllPayments(page = 1, limit = 10, filters = {}) {
    const skip = (page - 1) * limit;
    const query = {};
    if (filters.status) query.status = filters.status;
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
    }

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "username email");
    const total = await Payment.countDocuments(query);

    return {
      payments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPayments: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  // Verify payment (backup save)
  async verifyPayment(sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["payment_intent.payment_method", "payment_intent.charges"],
      });

      let stripePaymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id;

      if (!stripePaymentIntentId)
        throw new Error("Payment intent ID not found");

      let payment = await Payment.findOne({ stripePaymentIntentId });
      if (!payment) {
        // Save as backup if webhook missed it
        payment = new Payment({
          orderId: session.metadata.orderId,
          userId: session.metadata.userId,
          amount: session.amount_total / 100,
          currency: session.currency,
          status: session.payment_status === "paid" ? "succeeded" : "pending",
          stripePaymentIntentId,
          stripeCustomerId: session.customer,
          receiptUrl: session.payment_intent?.charges?.data?.[0]?.receipt_url,
          billingDetails: session.customer_details,
          metadata: session.metadata,
        });
        await payment.save();
      }

      return {
        session,
        payment,
        order: await Order.findOne({ orderId: session.metadata.orderId }),
      };
    } catch (error) {
      console.error("Payment verification error:", error);
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  }
}

module.exports = new PaymentService();
