// src/services/paymentHistoryService.ts
import api from "./api";

export interface Payment {
    _id: string;
    userId: string;
    paymentId: string;
    amount: number;
    currency: string;
    status: string;
    paymentMethod: string;
    orderId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaymentHistoryResponse {
    success: boolean;
    data: {
        payments: Payment[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalPayments: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    };
}

export const paymentHistoryService = {
    // Get payment history
    getPaymentHistory: async (
        page: number = 1,
        limit: number = 10
    ): Promise<PaymentHistoryResponse> => {
        try {
            const response = await api.get(`/api/payments/history?page=${page}&limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching payment history:", error);
            throw error;
        }
    },

    // Get payment by ID
    getPaymentById: async (
        paymentId: string
    ): Promise<{ success: boolean; data: Payment }> => {
        try {
            const response = await api.get(`/api/payments/${paymentId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching payment:", error);
            throw error;
        }
    },
};
