"use client";
import React, { useState } from "react";
import {
  ShoppingCart,
  Heart,
  Trash2,
  Plus,
  Minus,
  Tag,
  Package,
  MapPin,
  Mail,
  User,
  CreditCard,
} from "lucide-react";

const EcommerceSystem = () => {
  const [currentPage, setCurrentPage] = useState("cart");
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      productId: "68dc146bf14535961d8c3755",
      name: "Apple Watch Series 8",
      price: 188.0,
      quantity: 3,
      image: "🎮",
      inStock: true,
      category: "Electronics",
    },
    {
      id: 2,
      productId: "68dc0f4b29e8e49f3c7f9621",
      name: "Apple iPhone 13 Pro Max",
      price: 1660.0,
      quantity: 1,
      image: "📱",
      inStock: true,
      category: "Electronics",
    },
  ]);

  const [wishlistItems, setWishlistItems] = useState([
    {
      id: 3,
      productId: "68dc146bf14535961d8c3756",
      name: "Microsoft's Surface Hub 2S",
      price: 775.03,
      image: "🖥️",
      inStock: true,
      category: "Electronics",
    },
    {
      id: 4,
      productId: "68dc146bf14535961d8c3757",
      name: "Apple Watch Series 8",
      price: 188.0,
      image: "⌚",
      inStock: true,
      category: "Wearables",
    },
  ]);

  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Info, 2: Summary
  const [couponCode, setCouponCode] = useState("");

  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    email: "",
    line1: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
  });

  // Cart Functions
  const updateQuantity = (id, delta) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const removeFromWishlist = (id) => {
    setWishlistItems(wishlistItems.filter((item) => item.id !== id));
  };

  const addToCartFromWishlist = (item) => {
    const existingItem = cartItems.find((cartItem) => cartItem.id === item.id);
    if (existingItem) {
      updateQuantity(item.id, 1);
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
    }
    removeFromWishlist(item.id);
  };

  const moveToWishlist = (item) => {
    const wishlistItem = { ...item };
    delete wishlistItem.quantity;
    setWishlistItems([...wishlistItems, wishlistItem]);
    removeFromCart(item.id);
  };

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.1; // 10% tax
  const shipping = subtotal > 1000 ? 0 : 50;
  const total = subtotal + tax + shipping;

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate shipping form
  const validateShippingForm = () => {
    const required = [
      "name",
      "email",
      "line1",
      "city",
      "state",
      "postal_code",
      "country",
    ];
    return required.every((field) => shippingInfo[field].trim() !== "");
  };

  // Place Order Function
  const placeOrder = async () => {
    // Prepare Stripe API request body
    const orderData = {
      items: cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      customerEmail: shippingInfo.email,
      shippingAddress: {
        name: shippingInfo.name,
        line1: shippingInfo.line1,
        city: shippingInfo.city,
        state: shippingInfo.state,
        postal_code: shippingInfo.postal_code,
        country: shippingInfo.country,
      },
      metadata: {
        orderType: "online",
        promoCode: couponCode || "",
      },
    };

    try {
      // Here you would make your API call to Stripe
      console.log(
        "Order Data to be sent to Stripe:",
        JSON.stringify(orderData, null, 2)
      );

      // Example API call (uncomment and modify with your actual endpoint):
      // const response = await fetch('YOUR_STRIPE_API_ENDPOINT', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(orderData)
      // });
      // const result = await response.json();

      alert("Order placed successfully! Check console for API request body.");
      setShowCheckout(false);
      setCheckoutStep(1);
      setCartItems([]);
      setShippingInfo({
        name: "",
        email: "",
        line1: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",
      });
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    }
  };

  // Checkout Modal Component
  const CheckoutModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Checkout</h2>
            <button
              onClick={() => {
                setShowCheckout(false);
                setCheckoutStep(1);
              }}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          {/* Progress Indicator */}
          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  checkoutStep >= 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                1
              </div>
              <span className="text-sm font-medium">Shipping Info</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 rounded">
              <div
                className={`h-full rounded transition-all ${
                  checkoutStep >= 2 ? "bg-blue-600 w-full" : "bg-gray-200 w-0"
                }`}
              />
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  checkoutStep >= 2
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                2
              </div>
              <span className="text-sm font-medium">Review & Pay</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {checkoutStep === 1 ? (
            // Step 1: Shipping Information
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Mail className="text-blue-600" size={20} />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={shippingInfo.email}
                      onChange={handleInputChange}
                      placeholder="customer@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="text-blue-600" size={20} />
                  Shipping Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={shippingInfo.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="line1"
                      value={shippingInfo.line1}
                      onChange={handleInputChange}
                      placeholder="123 Main Street"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleInputChange}
                      placeholder="New York"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State/Province *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={shippingInfo.state}
                      onChange={handleInputChange}
                      placeholder="NY"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="postal_code"
                      value={shippingInfo.postal_code}
                      onChange={handleInputChange}
                      placeholder="10001"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country *
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={shippingInfo.country}
                      onChange={handleInputChange}
                      placeholder="US"
                      maxLength="2"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Tag className="text-blue-600" size={20} />
                  Promo Code (Optional)
                </h3>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter promo code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowCheckout(false);
                    setCheckoutStep(1);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (validateShippingForm()) {
                      setCheckoutStep(2);
                    } else {
                      alert("Please fill in all required fields");
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
                >
                  Continue to Review
                </button>
              </div>
            </div>
          ) : (
            // Step 2: Order Summary
            <div className="space-y-6">
              {/* Shipping Info Summary */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-3">
                  Shipping Information
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>Name:</strong> {shippingInfo.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {shippingInfo.email}
                  </p>
                  <p>
                    <strong>Address:</strong> {shippingInfo.line1}
                  </p>
                  <p>
                    <strong>City:</strong> {shippingInfo.city},{" "}
                    {shippingInfo.state} {shippingInfo.postal_code}
                  </p>
                  <p>
                    <strong>Country:</strong> {shippingInfo.country}
                  </p>
                  {couponCode && (
                    <p>
                      <strong>Promo Code:</strong> {couponCode}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setCheckoutStep(1)}
                  className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Edit Information
                </button>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">
                  Order Items
                </h3>
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="text-3xl">{item.image}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {item.productId}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Summary */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-800 pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setCheckoutStep(1)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={placeOrder}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <CreditCard size={20} />
                  Place Order
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Cart Page
  const CartPage = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Unit Price
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Quantity
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center text-3xl">
                        {item.image}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {item.inStock ? (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                              In Stock
                            </span>
                          ) : (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                              Out of Stock
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            {item.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-800">
                      ${item.price.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-12 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-gray-800">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => moveToWishlist(item)}
                        className="p-2 text-pink-500 hover:bg-pink-50 rounded-lg transition-colors"
                        title="Move to Wishlist"
                      >
                        <Heart size={18} />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Tag size={20} className="text-blue-600" />
            Apply Coupon Code
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter coupon code"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
              Apply
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Cart Totals</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (10%)</span>
              <span className="font-semibold">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className="font-semibold">
                {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between text-xl font-bold text-gray-800">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              if (cartItems.length === 0) {
                alert("Your cart is empty!");
                return;
              }
              setShowCheckout(true);
            }}
            className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );

  // Wishlist Page
  const WishlistPage = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Stock Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {wishlistItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center text-3xl">
                        {item.image}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {item.name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-800">
                      ${item.price.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {item.inStock ? (
                      <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                        In Stock
                      </span>
                    ) : (
                      <span className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium">
                        Out of Stock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => addToCartFromWishlist(item)}
                        disabled={!item.inStock}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <ShoppingCart size={16} />
                        Add to Cart
                      </button>
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {wishlistItems.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <Heart size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Your wishlist is empty
          </h3>
          <p className="text-gray-600">Start adding items you love!</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Shopping Experience
          </h1>
          <p className="text-gray-600">Manage your cart and wishlist</p>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setCurrentPage("cart")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              currentPage === "cart"
                ? "bg-white text-blue-600 shadow-md"
                : "bg-white/50 text-gray-600 hover:bg-white"
            }`}
          >
            <ShoppingCart size={20} />
            Shopping Cart
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">
              {cartItems.length}
            </span>
          </button>
          <button
            onClick={() => setCurrentPage("wishlist")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              currentPage === "wishlist"
                ? "bg-white text-pink-600 shadow-md"
                : "bg-white/50 text-gray-600 hover:bg-white"
            }`}
          >
            <Heart size={20} />
            Wishlist
            <span className="ml-2 px-2 py-1 bg-pink-100 text-pink-600 rounded-full text-xs font-bold">
              {wishlistItems.length}
            </span>
          </button>
        </div>

        {/* Content */}
        {currentPage === "cart" ? <CartPage /> : <WishlistPage />}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-800">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Cart Value</p>
                <p className="text-2xl font-bold text-gray-800">
                  ${subtotal.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <Heart className="text-pink-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Wishlist Items</p>
                <p className="text-2xl font-bold text-gray-800">
                  {wishlistItems.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && <CheckoutModal />}
    </div>
  );
};

export default EcommerceSystem;
