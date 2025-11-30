import { useState, useCallback } from "react";
import { ProductFilters } from "@/services/productService";

export const useProductFilters = (initialFilters: ProductFilters = {}) => {
  const [filters, setFilters] = useState<ProductFilters>({
    limit: 12,
    page: 1,
    sortBy: "createdAt",
    sortOrder: "desc",
    ...initialFilters,
  });

  const updateFilter = useCallback((key: keyof ProductFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key !== "page" ? { page: 1 } : {}), // Reset to page 1 when filters change
    }));
  }, []);

  const updateMultipleFilters = useCallback(
    (newFilters: Partial<ProductFilters>) => {
      setFilters((prev) => ({
        ...prev,
        ...newFilters,
        ...(Object.keys(newFilters).some((key) => key !== "page")
          ? { page: 1 }
          : {}),
      }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({
      limit: 12,
      page: 1,
      sortBy: "createdAt",
      sortOrder: "desc",
      ...initialFilters,
    });
  }, [initialFilters]);

  const setPage = useCallback(
    (page: number) => {
      updateFilter("page", page);
    },
    [updateFilter]
  );

  return {
    filters,
    updateFilter,
    updateMultipleFilters,
    resetFilters,
    setPage,
  };
};
