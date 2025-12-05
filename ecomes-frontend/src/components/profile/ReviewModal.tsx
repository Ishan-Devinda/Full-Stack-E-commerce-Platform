// src/components/profile/ReviewModal.tsx
"use client";

import React, { useState } from "react";
import { X, Star } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { themeConfig } from "@/lib/theme";
import { message } from "antd";
import api from "@/services/api";

interface ReviewModalProps {
    productId: string;
    productName: string;
    productImage?: string;
    onClose: () => void;
    onSuccess?: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
    productId,
    productName,
    productImage,
    onClose,
    onSuccess,
}) => {
    const { theme } = useTheme();
    const t = themeConfig[theme];
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            message.error("Please select a rating");
            return;
        }

        setSubmitting(true);
        try {
            const response = await api.post(`/api/products/${productId}/reviews`, {
                rating,
                comment,
            });

            if (response.data.success) {
                message.success("Review submitted successfully!");
                onSuccess?.();
                onClose();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || "Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className={`${t.card} rounded-lg max-w-md w-full p-6 ${t.shadow}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold">Write a Review</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Product Info */}
                    <div className="flex items-center space-x-4 mb-6 pb-6 border-b">
                        {productImage && (
                            <img
                                src={productImage}
                                alt={productName}
                                className="w-16 h-16 object-cover rounded"
                            />
                        )}
                        <div>
                            <p className="font-medium">{productName}</p>
                        </div>
                    </div>

                    {/* Review Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Rating */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Rating *
                            </label>
                            <div className="flex space-x-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoveredRating(star)}
                                        onMouseLeave={() => setHoveredRating(0)}
                                        className="focus:outline-none transition-transform hover:scale-110"
                                    >
                                        <Star
                                            className={`h-8 w-8 ${star <= (hoveredRating || rating)
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-gray-300"
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            {rating > 0 && (
                                <p className="text-sm text-gray-500 mt-2">
                                    {rating === 1 && "Poor"}
                                    {rating === 2 && "Fair"}
                                    {rating === 3 && "Good"}
                                    {rating === 4 && "Very Good"}
                                    {rating === 5 && "Excellent"}
                                </p>
                            )}
                        </div>

                        {/* Comment */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Review (Optional)
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={4}
                                placeholder="Share your experience with this product..."
                                className={`w-full px-4 py-2 rounded-lg border ${t.border} ${t.bg} ${t.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                disabled={submitting || rating === 0}
                                className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {submitting ? "Submitting..." : "Submit Review"}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default ReviewModal;
