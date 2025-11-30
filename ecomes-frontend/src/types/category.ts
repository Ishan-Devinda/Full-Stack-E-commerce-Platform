// src/types/category.ts

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  color: string;
  description?: string;
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  image: string;
  categoryId: string;
}

export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  discount?: number;
  inStock: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  onSale?: boolean;
  brand: string;
  categoryId: string;
  subCategoryId: string;
}

export interface FilterOptions {
  onSale: boolean;
  inStock: boolean;
  sortOrder: "asc" | "desc";
  sortBy: "price" | "rating" | "newest";
  minRating: number;
  maxPrice: number;
  minPrice: number;
  brands: string[];
}
