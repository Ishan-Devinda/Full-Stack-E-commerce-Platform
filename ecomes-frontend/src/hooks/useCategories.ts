import { useState, useEffect } from "react";
import { Category, categoryService } from "@/services/categoryService";

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refreshCategories: () => Promise<void>;
}

export const useCategories = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoryService.getCategories();

      // Check if response has success property and data array
      if (
        response &&
        response.success === true &&
        Array.isArray(response.data)
      ) {
        setCategories(response.data);
      } else {
        // If the structure is different, try to adapt
        console.warn("Unexpected API response structure:", response);

        // If response is directly an array, use it
        if (Array.isArray(response)) {
          setCategories(response);
        } else if (response.data && Array.isArray(response.data)) {
          setCategories(response.data);
        } else {
          setError("Invalid response format from server");
        }
      }
    } catch (err) {
      console.error("Error in useCategories:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch categories";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const refreshCategories = async () => {
    await fetchCategories();
  };

  return {
    categories,
    loading,
    error,
    refreshCategories,
  };
};
