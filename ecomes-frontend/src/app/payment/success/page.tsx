"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle, Package } from "lucide-react";
import { paymentService } from "@/services/paymentService";

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [verifying, setVerifying] = useState(true);
    const [order, setOrder] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const sessionId = searchParams.get("session_id");

        if (sessionId) {
            verifyPayment(sessionId);
        } else {
            setError("No session ID found");
            setVerifying(false);
        }
    }, [searchParams]);

    const verifyPayment = async (sessionId: string) => {
        try {
            const response = await paymentService.verifyPayment(sessionId);

            if (response.success) {
                setOrder(response.data.order);
            } else {
                setError("Payment verification failed");
            }
        } catch (error) {
            console.error("Payment verification error:", error);
            setError("Failed to verify payment");
        } finally {
            setVerifying(false);
        }
    };

    if (verifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={64} />
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                        Verifying Payment...
                    </h2>
                    <p className="text-gray-600">Please wait while we confirm your payment</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
                    <XCircle className="text-red-500 mx-auto mb-4" size={64} />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Payment Verification Failed
                    </h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => router.push("/Cart")}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Return to Cart
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-3xl mx-auto px-4">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Success Header */}
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-center">
                        <CheckCircle className="text-white mx-auto mb-4" size={80} />
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Payment Successful!
                        </h1>
                        <p className="text-green-50">
                            Thank you for your purchase. Your order has been confirmed.
                        </p>
                    </div>

                    {/* Order Details */}
                    {order && (
                        <div className="p-8">
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                    Order Details
                                </h2>
                                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Order ID:</span>
                                        <span className="font-semibold text-gray-800">{order.orderId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Amount:</span>
                                        <span className="font-bold text-gray-800 text-lg">
                                            ${order.totalAmount?.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                            {order.status || "Processing"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            {order.items && order.items.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                        Items Ordered
                                    </h3>
                                    <div className="space-y-3">
                                        {order.items.map((item: any, index: number) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                                            >
                                                {item.image && (
                                                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-800">{item.name}</h4>
                                                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                                        <span>Qty: {item.quantity}</span>
                                                        {item.size && <span>• Size: {item.size}</span>}
                                                        {item.color && <span>• Color: {item.color}</span>}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-gray-800">
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </p>
                                                    {item.discount > 0 && (
                                                        <p className="text-xs text-green-600">
                                                            {item.discount}% off
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-4">
                                <button
                                    onClick={() => router.push("/")}
                                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Continue Shopping
                                </button>
                                <button
                                    onClick={() => router.push("/orders")}
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Package size={20} />
                                    View Orders
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
