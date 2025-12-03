import api from "./api";

export interface CheckoutSessionRequest {
    items: Array<{
        productId: string;
        quantity: number;
        size?: string;
        color?: string;
    }>;
    customerEmail: string;
    shippingAddress: {
        name: string;
        line1: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
    };
    metadata?: Record<string, any>;
}

export interface CheckoutSessionResponse {
    success: boolean;
    message: string;
    data: {
        sessionId: string;
        url: string;
        orderId: string;
    };
}

export interface PaymentVerificationResponse {
    success: boolean;
    data: {
        session: any;
        payment: any;
        order: any;
    };
}

export const paymentService = {
    // Create checkout session
    createCheckoutSession: async (
        data: CheckoutSessionRequest
    ): Promise<CheckoutSessionResponse> => {
        const response = await api.post("/api/payments/create-checkout-session", data);
        return response.data;
    },

    // Verify payment
    verifyPayment: async (sessionId: string): Promise<PaymentVerificationResponse> => {
        const response = await api.post("/api/payments/verify", { sessionId });
        return response.data;
    },
};

export default paymentService;
