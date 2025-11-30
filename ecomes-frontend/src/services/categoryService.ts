import api from "./api";

export interface Category {
  _id: string;
  subcategories: string[];
  count: number;
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
}

export const categoryService = {
  // Get all categories
  getCategories: async (): Promise<CategoriesResponse> => {
    try {
      const response = await api.get("/api/products/categories");
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  // Get single category by ID/slug
  getCategory: async (
    slug: string
  ): Promise<{ success: boolean; data: Category }> => {
    try {
      const response = await api.get(`/api/products/categories/${slug}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching category:", error);
      throw error;
    }
  },
};
