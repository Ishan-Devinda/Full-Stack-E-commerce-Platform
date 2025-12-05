"use client";

import React, { useState, useCallback } from "react";
import { Upload, X, Camera, Loader2, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { themeConfig } from "@/lib/theme";

interface ImageSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ImageSearchModal({ isOpen, onClose }: ImageSearchModalProps) {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const router = useRouter();
    const { theme } = useTheme();
    const t = themeConfig[theme];

    const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setError("Image size must be less than 5MB");
                return;
            }

            // Validate file type
            if (!file.type.startsWith("image/")) {
                setError("Please select a valid image file");
                return;
            }

            setError("");
            setSelectedImage(file);
            setPreview(URL.createObjectURL(file));
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            if (file.size > 5 * 1024 * 1024) {
                setError("Image size must be less than 5MB");
                return;
            }
            setError("");
            setSelectedImage(file);
            setPreview(URL.createObjectURL(file));
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    const handleSearch = async () => {
        if (!selectedImage) return;

        setLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("image", selectedImage);

        try {
            const response = await fetch("http://localhost:5000/api/image-search/search-by-image", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (data.success && data.keywords && data.keywords.length > 0) {
                // Navigate to search page with keywords
                const searchQuery = data.keywords.join(" ");
                router.push(`/search?q=${encodeURIComponent(searchQuery)}&imageSearch=true`);
                onClose();
                // Clean up
                setSelectedImage(null);
                setPreview("");
            } else {
                setError(data.message || "Could not identify product in image. Try a clearer image.");
            }
        } catch (err) {
            console.error("Image search failed:", err);
            setError("Failed to search by image. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedImage(null);
        setPreview("");
        setError("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className={`${t.card} rounded-2xl max-w-md w-full p-6 ${t.shadow}`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Camera className="h-6 w-6 text-blue-500" />
                        <h2 className={`text-2xl font-bold ${t.text}`}>Search by Image</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className={`p-2 ${t.hover} rounded-lg transition-colors`}
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                )}

                {/* Upload Area */}
                {!preview ? (
                    <label
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        className={`border-2 border-dashed ${t.border} rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors ${t.bg}`}
                    >
                        <ImageIcon className="h-16 w-16 text-gray-400 mb-4" />
                        <p className={`text-lg font-semibold mb-2 ${t.text}`}>Upload Product Image</p>
                        <p className={`text-sm ${t.textSecondary} mb-4 text-center`}>
                            Click to browse or drag and drop
                        </p>
                        <p className={`text-xs ${t.textSecondary}`}>
                            Supported: JPG, PNG, GIF (Max 5MB)
                        </p>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                        />
                    </label>
                ) : (
                    <div className="space-y-4">
                        {/* Preview */}
                        <div className="relative">
                            <img
                                src={preview}
                                alt="Preview"
                                className={`w-full h-64 object-contain rounded-lg ${t.bgSecondary}`}
                            />
                            <button
                                onClick={() => {
                                    setPreview("");
                                    setSelectedImage(null);
                                    setError("");
                                }}
                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* File Info */}
                        <div className={`p-3 rounded-lg ${t.bgSecondary}`}>
                            <p className={`text-sm ${t.text} font-medium`}>{selectedImage?.name}</p>
                            <p className={`text-xs ${t.textSecondary}`}>
                                {(selectedImage!.size / 1024).toFixed(2)} KB
                            </p>
                        </div>

                        {/* Search Button */}
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Analyzing Image...
                                </>
                            ) : (
                                <>
                                    <Camera className="h-5 w-5" />
                                    Search Products
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Info */}
                <div className={`mt-4 p-3 rounded-lg ${t.bgSecondary}`}>
                    <p className={`text-xs ${t.textSecondary}`}>
                        💡 <strong>Tip:</strong> Use clear images with good lighting for best results
                    </p>
                </div>
            </div>
        </div>
    );
}
