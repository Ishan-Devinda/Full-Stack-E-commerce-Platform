// src/hooks/useHeroProducts.ts
import { useState, useEffect } from "react";
import api from "@/services/api";

interface HeroProduct {
    _id: string;
    name: string;
    images: string[];
    basePrice: number;
    salePrice: number;
    offers: {
        discountPercentage: number;
        isOnSale: boolean;
    };
    category: string;
    brand: string;
}

interface UseHeroProductsReturn {
    products: HeroProduct[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export const useHeroProducts = (limit: number = 10): UseHeroProductsReturn => {
    const [products, setProducts] = useState<HeroProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHeroProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(`/api/products/hero?limit=${limit}`);

            if (response.data.success) {
                setProducts(response.data.data);
            } else {
                setError("Failed to fetch hero products");
            }
        } catch (err: any) {
            console.error("Error fetching hero products:", err);
            setError(err.message || "An error occurred while fetching hero products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHeroProducts();
    }, [limit]);

    return {
        products,
        loading,
        error,
        refetch: fetchHeroProducts,
    };
};
