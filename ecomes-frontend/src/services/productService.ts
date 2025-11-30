import api from "./api";

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  subcategory: string;
  brand: string;
  inStock: boolean;
  onSale: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  rating: number;
  reviewCount: number;
  discount?: number;
  stockQuantity: number;
  specifications?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ProductFilters {
  limit?: number;
  page?: number;
  search?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  inStock?: boolean;
  onSale?: boolean;
}

export const productService = {
  // Get products with filters
  getProducts: async (
    filters: ProductFilters = {}
  ): Promise<ProductsResponse> => {
    try {
      const params = new URLSearchParams();

      // Add all filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/api/products?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  // Get single product by ID
  getProduct: async (
    id: string
  ): Promise<{ success: boolean; data: Product }> => {
    try {
      const response = await api.get(`/api/products/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  },

  // Get featured products
  getFeaturedProducts: async (limit: number = 8): Promise<ProductsResponse> => {
    return productService.getProducts({
      limit,
      sortBy: "rating",
      sortOrder: "desc",
    });
  },

  // Get products on sale
  getOnSaleProducts: async (limit: number = 8): Promise<ProductsResponse> => {
    return productService.getProducts({
      limit,
      onSale: true,
      sortBy: "discount",
      sortOrder: "desc",
    });
  },
};
