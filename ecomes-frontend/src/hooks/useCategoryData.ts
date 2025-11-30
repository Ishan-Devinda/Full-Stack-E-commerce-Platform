import { useState, useEffect } from "react";
import { Category, categoryService } from "@/services/categoryService";

export const useCategoryData = (slug?: string) => {
  const [category, setCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoryService.getCategories();

      if (response && response.success && Array.isArray(response.data)) {
        setCategories(response.data);

        // If slug is provided, find the specific category
        if (slug) {
          const foundCategory = response.data.find((cat) => cat._id === slug);
          setCategory(foundCategory || null);
        }
      } else {
        setError("Invalid response format from server");
      }
    } catch (err) {
      console.error("Error in useCategoryData:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch categories";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [slug]);

  const refreshData = async () => {
    await fetchCategories();
  };

  return {
    category,
    categories,
    loading,
    error,
    refreshData,
  };
};
