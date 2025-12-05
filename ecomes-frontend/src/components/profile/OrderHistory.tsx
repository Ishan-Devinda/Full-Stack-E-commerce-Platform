// src/components/profile/OrderHistory.tsx
"use client";

import React, { useState } from "react";
import { useOrders } from "@/hooks/useOrders";
import { Loader2, Package, ChevronRight, Star } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { themeConfig } from "@/lib/theme";
import { Pagination } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ReviewModal from "./ReviewModal";

const OrderHistory: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const { orders, loading, pagination, fetchOrders } = useOrders(currentPage, 10);
    const { theme } = useTheme();
    const t = themeConfig[theme];
    const router = useRouter();
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<{
        id: string;
        name: string;
        image?: string;
    } | null>(null);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchOrders(page);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Order History</h2>

            {orders.length === 0 ? (
                <div className={`${t.card} rounded-lg p-12 text-center`}>
                    <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className={t.textSecondary}>No orders yet</p>
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div
                                key={order._id}
                                className={`${t.card} rounded-lg p-6 ${t.shadow}`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Order #{order._id.slice(-8)}</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-lg">${order.totalAmount.toFixed(2)}</p>
                                        <span
                                            className={`text-xs px-2 py-1 rounded ${order.status === "delivered"
                                                ? "bg-green-100 text-green-800"
                                                : order.status === "processing"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                                }`}
                                        >
                                            {order.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Products in Order */}
                                <div className="space-y-3 mb-4">
                                    {order.items.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex items-center justify-between p-3 border ${t.border} rounded-lg`}
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="relative w-16 h-16 rounded overflow-hidden">
                                                    {item.productId?.images?.[0] && (
                                                        <Image
                                                            src={item.productId.images[0]}
                                                            alt={item.productId.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{item.productId?.name}</p>
                                                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                    <p className="text-sm font-semibold">${item.price.toFixed(2)}</p>
                                                </div>
                                            </div>

                                            {/* Review Button - Shows for all products */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedProduct({
                                                        id: item.productId._id,
                                                        name: item.productId.name,
                                                        image: item.productId.images?.[0],
                                                    });
                                                    setReviewModalOpen(true);
                                                }}
                                                className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                                            >
                                                <Star className="h-4 w-4" />
                                                <span>Review</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center pt-3 border-t">
                                    <p className={t.textSecondary}>
                                        {order.items.length} item{order.items.length > 1 ? "s" : ""}
                                    </p>
                                    <button
                                        onClick={() => router.push(`/profile/orders/${order._id}`)}
                                        className="flex items-center text-blue-500 hover:text-blue-600"
                                    >
                                        <span className="text-sm">View Details</span>
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex justify-center mt-8">
                            <Pagination
                                current={pagination.currentPage}
                                total={pagination.totalOrders}
                                pageSize={10}
                                onChange={handlePageChange}
                                showSizeChanger={false}
                            />
                        </div>
                    )}
                </>
            )}

            {/* Review Modal */}
            {reviewModalOpen && selectedProduct && (
                <ReviewModal
                    productId={selectedProduct.id}
                    productName={selectedProduct.name}
                    productImage={selectedProduct.image}
                    onClose={() => {
                        setReviewModalOpen(false);
                        setSelectedProduct(null);
                    }}
                    onSuccess={() => {
                        // Optionally refetch orders to update UI
                        fetchOrders(currentPage);
                    }}
                />
            )}
        </div>
    );
};

export default OrderHistory;
