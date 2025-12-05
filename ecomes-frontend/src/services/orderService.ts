// src/services/orderService.ts
import api from "./api";

export interface OrderItem {
    productId: {
        _id: string;
        name: string;
        images: string[];
    };
    quantity: number;
    price: number;
    size?: string;
    color?: string;
}

export interface Order {
    _id: string;
    userId: string;
    items: OrderItem[];
    totalAmount: number;
    status: string;
    paymentStatus: string;
    shippingAddress: any;
    createdAt: string;
    updatedAt: string;
}

export interface OrdersResponse {
    success: boolean;
    data: {
        orders: Order[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalOrders: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    };
}

export const orderService = {
    // Get order history
    getOrders: async (page: number = 1, limit: number = 10): Promise<OrdersResponse> => {
        try {
            const response = await api.get(`/api/user/orders?page=${page}&limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching orders:", error);
            throw error;
        }
    },

    // Get single order by ID
    getOrderById: async (orderId: string): Promise<{ success: boolean; data: Order }> => {
        try {
            const response = await api.get(`/api/user/orders/${orderId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching order:", error);
            throw error;
        }
    },
};
