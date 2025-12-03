const stripe = require("../config/stripe");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const Product = require("../models/Product");
const mongoose = require("mongoose");

class PaymentService {
  // Create Stripe Checkout Session
  async createCheckoutSession(orderData) {
    try {
      const { userId, items, customerEmail, shippingAddress, metadata } = orderData;

      // Validate items array
      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error("Items array is required and cannot be empty");
      }

      const lineItems = [];
      let totalAmount = 0;
      const orderItems = [];

      console.log('=== Starting Checkout Session Creation ===');
      console.log('Number of items:', items.length);

      for (const item of items) {
        console.log('\n--- Processing item:', item);

        // Validate productId format
        if (!mongoose.Types.ObjectId.isValid(item.productId)) {
          throw new Error(`Invalid product ID format: ${item.productId}`);
        }

        // Find product
        const product = await Product.findById(item.productId).lean();

        if (!product) {
          throw new Error(`Product not found with ID: ${item.productId}`);
        }

        console.log('Product found:', {
          name: product.name,
          basePrice: product.basePrice,
          salePrice: product.salePrice,
          stock: product.stock,
          offers: product.offers
        });

        // Check stock
        const requestedQty = parseInt(item.quantity) || 1;
        if (product.stock < requestedQty) {
          throw new Error(
            `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${requestedQty}`
          );
        }

        // Validate quantity
        if (requestedQty < 1) {
          throw new Error(`Invalid quantity for product: ${product.name}`);
        }

        // Get prices and convert to numbers explicitly
        const basePrice = parseFloat(product.basePrice);
        const salePrice = product.salePrice ? parseFloat(product.salePrice) : null;

        console.log('Parsed prices:', { basePrice, salePrice });

        // Validate base price
        if (!basePrice || isNaN(basePrice) || basePrice <= 0) {
          console.error('Invalid base price detected:', {
            raw: product.basePrice,
            parsed: basePrice,
            productId: product._id,
            productName: product.name
          });
          throw new Error(
            `Product "${product.name}" has an invalid price (${product.basePrice}). Please contact support.`
          );
        }

        // Determine unit price
        let unitPrice = basePrice;

        // Use salePrice if it's valid and actually lower than basePrice
        if (salePrice && !isNaN(salePrice) && salePrice > 0 && salePrice < basePrice) {
          unitPrice = salePrice;
          console.log('Using sale price:', unitPrice);
        } else {
          console.log('Using base price:', unitPrice);
        }

        // Calculate final price with any additional offers discount
        let finalPrice = unitPrice;
        let discountPercentage = 0;

        // Safely check for offers discount
        if (product.offers &&
          typeof product.offers === 'object' &&
          product.offers.discountPercentage) {

          const offerDiscount = parseFloat(product.offers.discountPercentage);

          if (!isNaN(offerDiscount) && offerDiscount > 0 && offerDiscount <= 100) {
            discountPercentage = offerDiscount;
            const discountAmount = (unitPrice * discountPercentage) / 100;
            finalPrice = unitPrice - discountAmount;
            console.log('Applied offer discount:', {
              percentage: discountPercentage,
              discountAmount,
              finalPrice
            });
          }
        }

        // Final validation of finalPrice
        if (isNaN(finalPrice) || finalPrice <= 0) {
          console.error('Invalid final price:', {
            unitPrice,
            discountPercentage,
            finalPrice,
            calculation: `${unitPrice} - (${unitPrice} * ${discountPercentage} / 100)`
          });
          throw new Error(`Price calculation failed for "${product.name}"`);
        }

        // Round to 2 decimal places
        finalPrice = Math.round(finalPrice * 100) / 100;

        // Calculate item total
        const itemTotal = finalPrice * requestedQty;

        if (isNaN(itemTotal) || itemTotal <= 0) {
          console.error('Invalid item total:', {
            finalPrice,
            requestedQty,
            itemTotal
          });
          throw new Error(`Total calculation failed for "${product.name}"`);
        }

        totalAmount += itemTotal;

        console.log('Item calculation complete:', {
          name: product.name,
          basePrice,
          unitPrice,
          finalPrice,
          quantity: requestedQty,
          itemTotal,
          runningTotal: totalAmount
        });

        // Store order item details
        orderItems.push({
          productId: product._id,
          name: product.name,
          price: finalPrice,
          originalPrice: unitPrice,
          quantity: requestedQty,
          size: item.size || null,
          color: item.color || null,
          image: (product.images && product.images.length > 0) ? product.images[0] : null,
          discount: discountPercentage
        });

        // Build product description
        let productDescription = product.shortDescription || product.description || product.name;
        if (productDescription.length > 200) {
          productDescription = productDescription.substring(0, 197) + '...';
        }
        if (item.size) productDescription += ` | Size: ${item.size}`;
        if (item.color) productDescription += ` | Color: ${item.color}`;

        // Create Stripe line item
        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
              description: productDescription.replace(/<[^>]*>/g, ''), // Strip HTML
              images: (product.images && product.images.length > 0) ? [product.images[0]] : [],
              metadata: {
                productId: product._id.toString(),
                size: item.size || '',
                color: item.color || ''
              },
            },
            unit_amount: Math.round(finalPrice * 100), // Stripe expects cents
          },
          quantity: requestedQty,
        });
      }

      // Final total validation
      if (isNaN(totalAmount) || totalAmount <= 0) {
        console.error('CRITICAL: Invalid total amount:', {
          totalAmount,
          orderItems: orderItems.map(i => ({
            name: i.name,
            price: i.price,
            quantity: i.quantity
          }))
        });
        throw new Error('Order total is invalid. Please contact support.');
      }

      // Round total to 2 decimal places
      totalAmount = Math.round(totalAmount * 100) / 100;

      console.log('\n=== Order Summary ===');
      console.log('Total Items:', orderItems.length);
      console.log('Total Amount: $', totalAmount);

      // Generate unique order ID
      const orderId = "ORD_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9).toUpperCase();

      // Create and save order
      const order = new Order({
        orderId,
        userId,
        items: orderItems,
        totalAmount,
        currency: "usd",
        customerEmail,
        shippingAddress,
        metadata,
      });

      await order.save();
      console.log('Order saved successfully:', orderId);

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
        customer_email: customerEmail,
        client_reference_id: orderId,
        metadata: {
          orderId: orderId,
          userId: userId.toString()
        },
        shipping_address_collection: {
          allowed_countries: ["US", "CA", "GB", "AU", "IN"],
        },
        billing_address_collection: "required",
      });

      console.log('Stripe session created:', session.id);
      console.log('=== Checkout Session Creation Complete ===\n');

      return {
        sessionId: session.id,
        url: session.url,
        orderId: orderId,
        totalAmount: totalAmount
      };

    } catch (error) {
      console.error('\n=== ERROR in createCheckoutSession ===');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
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
  async createRefund(paymentIntentId, amount, reason = "requested_by_customer") {
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

      // Clear user's cart after successful payment
      if (session.payment_status === "paid") {
        const User = require("../models/User");
        await User.findByIdAndUpdate(session.metadata.userId, {
          "cart.items": [],
          "cart.totalItems": 0,
          "cart.totalAmount": 0
        });
      }

      return {
        session,
        payment,
        order: await Order.findOne({ orderId: session.metadata.orderId })
          .populate("items.productId", "name images"),
      };
    } catch (error) {
      console.error("Payment verification error:", error);
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  }
}

module.exports = new PaymentService();