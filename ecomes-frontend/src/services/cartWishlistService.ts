import api from "./api";

// Types
export interface AddToCartRequest {
    productId: string;
    quantity: number;
    size?: string;
    color?: string;
}

export interface UpdateCartQuantityRequest {
    quantity: number;
}

export interface AddToWishlistRequest {
    productId: string;
}

export interface CartItem {
    _id: string;
    productId: {
        _id: string;
        name: string;
        images: string[];
        basePrice?: number;
        salePrice?: number;
        category?: string;
        brand?: string;
        stock: number;
        offers?: {
            discountPercentage: number;
            isOnSale: boolean;
            freeShipping: boolean;
        };
    };
    quantity: number;
    size?: string;
    color?: string;
    unitPrice?: number;        // Final price after discount
    originalPrice?: number;    // Original price before discount
    total?: number;            // unitPrice × quantity
    discount?: number;         // Discount percentage
    addedAt: string;
}

export interface WishlistItem {
    _id: string;
    productId: {
        _id: string;
        name: string;
        images: string[];
        basePrice: number;
        salePrice: number;
        category: string;
        brand: string;
        stock: number;
    };
    addedAt: string;
}

export interface CartResponse {
    success: boolean;
    data: {
        cart: {
            totalItems: number;
            totalAmount: number;
            items: CartItem[];
            lastUpdated: string;
        };
        totalAmount: number;
    };
}

export interface WishlistResponse {
    success: boolean;
    data: WishlistItem[];
}

// Cart APIs
export const cartWishlistAPI = {
    // Add product to cart
    addToCart: (data: AddToCartRequest) =>
        api.post("/api/user/cart/", data),

    // Get all cart items
    getCart: () =>
        api.get<CartResponse>("/api/user/cart"),

    // Update cart item quantity
    updateCartQuantity: (productId: string, data: UpdateCartQuantityRequest) =>
        api.put(`/api/user/cart/${productId}`, data),

    // Delete cart item
    deleteCartItem: (productId: string) =>
        api.delete(`/api/user/cart/${productId}`),

    // Add product to wishlist
    addToWishlist: (data: AddToWishlistRequest) =>
        api.post("/api/user/wishlist", data),

    // Get all wishlist items
    getWishlist: () =>
        api.get<WishlistResponse>("/api/user/wishlist"),

    // Delete wishlist item
    deleteWishlistItem: (productId: string) =>
        api.delete(`/api/user/wishlist/${productId}`),
};

export default cartWishlistAPI;
