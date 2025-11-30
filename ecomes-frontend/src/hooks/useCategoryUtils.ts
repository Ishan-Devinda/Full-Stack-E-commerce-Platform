import { useCategories } from "./useCategories";

export const useCategoryUtils = () => {
  const { categories } = useCategories();

  // Convert category ID to display name
  const getCategoryDisplayName = (categoryId: string): string => {
    const words = categoryId.split(/[-_]/);
    return words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Get category by ID
  const getCategoryById = (categoryId: string) => {
    return categories.find((cat) => cat._id === categoryId);
  };

  // Get all subcategories for a category
  const getSubcategories = (categoryId: string): string[] => {
    const category = getCategoryById(categoryId);
    return category?.subcategories || [];
  };

  // Format subcategory name
  const formatSubcategoryName = (subcategory: string): string => {
    return subcategory
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Get emoji for category
  const getCategoryEmoji = (categoryId: string): string => {
    const emojiMap: Record<string, string> = {
      electronics: "📱",
      clothing: "👕",
      shoes: "👟",
      furniture: "🛋️",
      "home-appliances": "🏠",
      phones: "📞",
      laptops: "💻",
      accessories: "👓",
      "jewelry-watches": "⌚",
    };
    return emojiMap[categoryId] || "🛍️";
  };

  // Get color gradient for category
  const getCategoryColor = (categoryId: string): string => {
    const colorMap: Record<string, string> = {
      electronics: "from-blue-500 to-cyan-500",
      clothing: "from-pink-500 to-rose-500",
      shoes: "from-indigo-500 to-blue-500",
      furniture: "from-amber-500 to-orange-500",
      "home-appliances": "from-green-500 to-emerald-500",
      phones: "from-purple-500 to-pink-500",
      laptops: "from-gray-500 to-slate-500",
      accessories: "from-yellow-500 to-amber-500",
      "jewelry-watches": "from-red-500 to-pink-500",
    };
    return colorMap[categoryId] || "from-gray-500 to-slate-500";
  };

  return {
    getCategoryDisplayName,
    getCategoryById,
    getSubcategories,
    formatSubcategoryName,
    getCategoryEmoji,
    getCategoryColor,
  };
};
