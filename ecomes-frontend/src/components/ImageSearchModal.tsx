"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { X, Camera, Loader2, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { themeConfig } from "@/lib/theme";
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

interface ImageSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Category mapping to convert specific items to broader categories
const CATEGORY_MAPPING: { [key: string]: string[] } = {
    // Footwear
    'shoe': ['shoes', 'footwear'],
    'sneaker': ['shoes', 'footwear', 'sneakers'],
    'boot': ['shoes', 'footwear', 'boots'],
    'sandal': ['shoes', 'footwear', 'sandals'],
    'slipper': ['shoes', 'footwear', 'slippers'],

    // Watches & Accessories
    'watch': ['watch', 'watches', 'timepiece'],
    'wristwatch': ['watch', 'watches'],
    'clock': ['watch', 'watches', 'clock'],

    // Electronics
    'laptop': ['laptop', 'computer', 'electronics'],
    'notebook': ['laptop', 'computer', 'electronics'],
    'computer': ['computer', 'electronics', 'laptop'],
    'phone': ['phone', 'mobile', 'smartphone', 'electronics'],
    'tablet': ['tablet', 'electronics'],
    'monitor': ['monitor', 'display', 'electronics'],
    'keyboard': ['keyboard', 'computer', 'electronics'],
    'mouse': ['mouse', 'computer', 'electronics'],

    // Clothing
    'shirt': ['shirt', 'clothing', 'apparel'],
    'tshirt': ['tshirt', 't-shirt', 'clothing', 'apparel'],
    'dress': ['dress', 'clothing', 'apparel'],
    'jean': ['jeans', 'pants', 'clothing', 'apparel'],
    'jacket': ['jacket', 'clothing', 'apparel', 'outerwear'],
    'coat': ['coat', 'clothing', 'apparel', 'outerwear'],
    'sweater': ['sweater', 'clothing', 'apparel'],

    // Bags
    'bag': ['bag', 'bags'],
    'backpack': ['backpack', 'bag', 'bags'],
    'handbag': ['handbag', 'bag', 'bags'],
    'purse': ['purse', 'bag', 'bags'],

    // Furniture
    'chair': ['chair', 'furniture'],
    'table': ['table', 'furniture'],
    'desk': ['desk', 'furniture', 'table'],
    'sofa': ['sofa', 'furniture', 'couch'],
    'bed': ['bed', 'furniture'],

    // Sports & Fitness
    'ball': ['ball', 'sports'],
    'racket': ['racket', 'sports'],
    'dumbbell': ['dumbbell', 'fitness', 'sports'],

    // Kitchen
    'bottle': ['bottle', 'drinkware'],
    'cup': ['cup', 'mug', 'drinkware'],
    'mug': ['mug', 'cup', 'drinkware'],
    'plate': ['plate', 'dinnerware'],
};

export default function ImageSearchModal({ isOpen, onClose }: ImageSearchModalProps) {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [loadingModel, setLoadingModel] = useState(false);
    const [error, setError] = useState<string>("");
    const router = useRouter();
    const { theme } = useTheme();
    const t = themeConfig[theme];
    const imageRef = useRef<HTMLImageElement>(null);
    const modelRef = useRef<mobilenet.MobileNet | null>(null);

    // Initialize TensorFlow.js backend
    useEffect(() => {
        const initTensorFlow = async () => {
            try {
                await tf.ready();
                console.log('✅ TensorFlow.js backend ready:', tf.getBackend());
            } catch (err) {
                console.error('❌ Failed to initialize TensorFlow.js:', err);
            }
        };
        initTensorFlow();
    }, []);

    const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError("Image size must be less than 5MB");
                return;
            }

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

    // Extract broader category keywords from AI predictions
    const extractCategoryKeywords = (predictions: any[]): string[] => {
        const allKeywords = new Set<string>();

        predictions.forEach((p) => {
            // Get the first word from className (most important)
            const firstWord = p.className
                .toLowerCase()
                .split(',')[0] // Take only first part before comma
                .split(' ')[0] // Take only first word
                .replace(/_/g, ' ')
                .trim();

            // Add the original keyword
            allKeywords.add(firstWord);

            // Check if we have a category mapping
            Object.keys(CATEGORY_MAPPING).forEach((key) => {
                if (firstWord.includes(key) || key.includes(firstWord)) {
                    // Add all mapped categories
                    CATEGORY_MAPPING[key].forEach((cat) => allKeywords.add(cat));
                }
            });
        });

        return Array.from(allKeywords).slice(0, 8); // Return top 8 keywords
    };

    const handleSearch = async () => {
        if (!selectedImage || !imageRef.current) return;

        setLoading(true);
        setError("");

        try {
            await tf.ready();

            if (!modelRef.current) {
                setLoadingModel(true);
                console.log('🤖 Loading TensorFlow.js MobileNet model...');
                modelRef.current = await mobilenet.load();
                setLoadingModel(false);
                console.log('✅ Model loaded successfully');
            }

            console.log('🔍 Classifying image...');
            const predictions = await modelRef.current.classify(imageRef.current);
            console.log('🎯 Raw predictions:', predictions);

            // Extract broader category keywords
            const keywords = extractCategoryKeywords(
                predictions.filter((p) => p.probability > 0.05)
            );

            console.log('✅ Extracted category keywords:', keywords);

            if (keywords.length > 0) {
                const searchQuery = keywords.join(" ");
                router.push(`/search?q=${encodeURIComponent(searchQuery)}&imageSearch=true`);
                onClose();
                setSelectedImage(null);
                setPreview("");
            } else {
                setError("Could not identify product in image. Try a clearer image.");
            }
        } catch (err) {
            console.error("❌ Image classification failed:", err);
            setError("Failed to analyze image. Please try again.");
        } finally {
            setLoading(false);
            setLoadingModel(false);
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
                        <h2 className={`text-2xl font-bold ${t.text}`}>AI Image Search</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className={`p-2 ${t.hover} rounded-lg transition-colors`}
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Info Banner */}
                <div className={`mb-4 p-3 rounded-lg ${t.bgSecondary} border ${t.border}`}>
                    <p className={`text-xs ${t.textSecondary}`}>
                        🤖 <strong>Powered by TensorFlow.js</strong> - Searches by category, subcategory & product name!
                    </p>
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
                                ref={imageRef}
                                src={preview}
                                alt="Preview"
                                className={`w-full h-64 object-contain rounded-lg ${t.bgSecondary}`}
                                crossOrigin="anonymous"
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
                            disabled={loading || loadingModel}
                            className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loadingModel ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Loading AI Model...
                                </>
                            ) : loading ? (
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
                        💡 <strong>Tip:</strong> Upload clear product images. AI will search across categories, subcategories & product names!
                    </p>
                </div>
            </div>
        </div>
    );
}
