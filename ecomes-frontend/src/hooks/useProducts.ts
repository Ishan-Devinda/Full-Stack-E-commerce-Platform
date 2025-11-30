import { useState, useEffect } from "react";
import {
  Product,
  ProductsResponse,
  ProductFilters,
  productService,
} from "@/services/productService";

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  pagination: ProductsResponse["pagination"] | null;
  refreshProducts: () => Promise<void>;
}

export const useProducts = (
  filters: ProductFilters = {}
): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<
    ProductsResponse["pagination"] | null
  >(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getProducts(filters);

      if (response && response.success) {
        setProducts(response.data || []);
        setPagination(response.pagination || null);
      } else {
        setError("Failed to fetch products");
      }
    } catch (err) {
      console.error("Error in useProducts:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch products";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [JSON.stringify(filters)]); // Using JSON.stringify to compare object changes

  const refreshProducts = async () => {
    await fetchProducts();
  };

  return {
    products,
    loading,
    error,
    pagination,
    refreshProducts,
  };
};
