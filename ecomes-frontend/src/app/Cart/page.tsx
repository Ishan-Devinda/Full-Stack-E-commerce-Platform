"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  CreditCard,
  Loader2,
} from "lucide-react";
import { cartWishlistAPI } from "@/services/cartWishlistService";
import type { CartItem, WishlistItem } from "@/services/cartWishlistService";
import { paymentService } from "@/services/paymentService";

const EcommerceSystem = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState("cart");

  // State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [couponCode, setCouponCode] = useState("");

  console.log(cartItems);


  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    email: "",
    line1: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
  });

  // Fetch cart and wishlist on mount
  useEffect(() => {
    fetchCartAndWishlist();
  }, []);

  const fetchCartAndWishlist = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setLoading(false);
        return;
      }

      const [cartResponse, wishlistResponse] = await Promise.all([
        cartWishlistAPI.getCart().catch(() => ({ data: { data: { cart: { items: [] } } } })),
        cartWishlistAPI.getWishlist().catch(() => ({ data: { data: [] } })),
      ]);

      // Extract cart items from nested structure
      setCartItems(cartResponse.data?.data?.cart?.items || []);

      // Extract wishlist - handle both possible structures
      const wishlistData = wishlistResponse.data?.data;
      setWishlistItems(Array.isArray(wishlistData) ? wishlistData : ((wishlistData as any)?.wishlist || []));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to calculate price and total
  const getItemPrice = (item: CartItem) => {
    // Use unitPrice from API if available, otherwise calculate
    if (item.unitPrice !== undefined) return item.unitPrice;
    return item.productId.salePrice || item.productId.basePrice || 0;
  };

  const getItemTotal = (item: CartItem) => {
    // Use total from API if available, otherwise calculate
    if (item.total !== undefined) return item.total;
    return getItemPrice(item) * item.quantity;
  };

  const getWishlistItemPrice = (item: WishlistItem) => {
    return item.productId.salePrice || item.productId.basePrice || 0;
  };

  // Cart Functions
  const updateQuantity = async (productId: string, newQuantity: number) => {
    try {
      setCartLoading(true);
      await cartWishlistAPI.updateCartQuantity(productId, { quantity: newQuantity });

      // Refetch cart to get updated totals from backend
      await fetchCartAndWishlist();
    } catch (error: any) {
      console.error("Error updating quantity:", error);
      alert(error.response?.data?.message || "Failed to update quantity");
    } finally {
      setCartLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      setCartLoading(true);
      await cartWishlistAPI.deleteCartItem(productId);
      setCartItems(cartItems.filter((item) => item.productId._id !== productId));
    } catch (error: any) {
      console.error("Error removing from cart:", error);
      alert(error.response?.data?.message || "Failed to remove item");
    } finally {
      setCartLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      setWishlistLoading(true);
      await cartWishlistAPI.deleteWishlistItem(productId);
      setWishlistItems(wishlistItems.filter((item) => item.productId._id !== productId));
    } catch (error: any) {
      console.error("Error removing from wishlist:", error);
      alert(error.response?.data?.message || "Failed to remove item");
    } finally {
      setWishlistLoading(false);
    }
  };

  const addToCartFromWishlist = async (item: WishlistItem) => {
    try {
      setWishlistLoading(true);

      // Add to cart
      await cartWishlistAPI.addToCart({
        productId: item.productId._id,
        quantity: 1,
      });

      // Remove from wishlist
      await cartWishlistAPI.deleteWishlistItem(item.productId._id);

      // Refresh data
      await fetchCartAndWishlist();
    } catch (error: any) {
      console.error("Error moving to cart:", error);
      alert(error.response?.data?.message || "Failed to move item to cart");
    } finally {
      setWishlistLoading(false);
    }
  };

  const moveToWishlist = async (item: CartItem) => {
    try {
      setCartLoading(true);

      // Add to wishlist
      await cartWishlistAPI.addToWishlist({
        productId: item.productId._id,
      });

      // Remove from cart
      await cartWishlistAPI.deleteCartItem(item.productId._id);

      // Refresh data
      await fetchCartAndWishlist();
    } catch (error: any) {
      console.error("Error moving to wishlist:", error);
      alert(error.response?.data?.message || "Failed to move item to wishlist");
    } finally {
      setCartLoading(false);
    }
  };

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + getItemTotal(item),
    0
  );
  const tax = 0;
  const shipping = 0;
  const total = subtotal + tax + shipping;

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    return required.every((field) => shippingInfo[field as keyof typeof shippingInfo].trim() !== "");
  };

  // Place Order Function
  const placeOrder = async () => {
    try {
      setLoading(true);

      // Create checkout session
      const checkoutData = {
        items: cartItems.map((item) => ({
          productId: item.productId._id,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
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

      const response = await paymentService.createCheckoutSession(checkoutData);

      if (response.success && response.data.url) {
        // Redirect to Stripe checkout
        window.location.href = response.data.url;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Check authentication
  const checkAuth = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Please login to continue");
      router.push("/auth/login");
      return false;
    }
    return true;
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
                className={`w-8 h-8 rounded-full flex items-center justify-center ${checkoutStep >= 1
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
                className={`h-full rounded transition-all ${checkoutStep >= 2 ? "bg-blue-600 w-full" : "bg-gray-200 w-0"
                  }`}
              />
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${checkoutStep >= 2
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
                      maxLength={2}
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
                      key={item._id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {item.productId.images?.[0] && (
                          <img
                            src={item.productId.images[0]}
                            alt={item.productId.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">
                          {item.productId.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity}
                        </p>
                        {item.size && (
                          <p className="text-xs text-gray-500">Size: {item.size}</p>
                        )}
                        {item.color && (
                          <p className="text-xs text-gray-500">Color: {item.color}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">
                          ${getItemTotal(item).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          ${getItemPrice(item).toFixed(2)} each
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
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      ) : cartItems.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Your cart is empty
          </h3>
          <p className="text-gray-600">Start adding items to your cart!</p>
        </div>
      ) : (
        <>
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
                      key={item._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                            {item.productId.images?.[0] ? (
                              <img
                                src={item.productId.images[0]}
                                alt={item.productId.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="text-gray-400" size={32} />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {item.productId.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">
                                {item.productId.category}
                              </span>
                            </div>
                            {item.size && (
                              <span className="text-xs text-gray-500">
                                Size: {item.size}
                              </span>
                            )}
                            {item.color && (
                              <span className="text-xs text-gray-500 ml-2">
                                Color: {item.color}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-800">
                          ${getItemPrice(item).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.productId._id, Math.max(1, item.quantity - 1))}
                            disabled={cartLoading || item.quantity <= 1}
                            className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-12 text-center font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId._id, item.quantity + 1)}
                            disabled={cartLoading}
                            className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-800">
                          ${getItemTotal(item).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => moveToWishlist(item)}
                            disabled={cartLoading}
                            className="p-2 text-pink-500 hover:bg-pink-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Move to Wishlist"
                          >
                            <Heart size={18} />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.productId._id)}
                            disabled={cartLoading}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <span>Tax </span>
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
                  if (!checkAuth()) return;
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
        </>
      )}
    </div>
  );

  // Wishlist Page
  const WishlistPage = () => (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-pink-600" size={48} />
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <Heart size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Your wishlist is empty
          </h3>
          <p className="text-gray-600">Start adding items you love!</p>
        </div>
      ) : (
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
                    key={item._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                          {item.productId.images?.[0] ? (
                            <img
                              src={item.productId.images[0]}
                              alt={item.productId.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="text-gray-400" size={32} />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {item.productId.name}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {item.productId.category}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-800">
                        ${getWishlistItemPrice(item).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.productId.stock > 0 ? (
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
                          disabled={wishlistLoading || item.productId.stock === 0}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <ShoppingCart size={16} />
                          Add to Cart
                        </button>
                        <button
                          onClick={() => removeFromWishlist(item.productId._id)}
                          disabled={wishlistLoading}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      )}
    </div>
  );

  return (
    <div className="min-h-screen relative p-4 md:p-8">
      <div className="max-w-7xl mx-auto relative z-10">
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
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${currentPage === "cart"
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
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${currentPage === "wishlist"
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
