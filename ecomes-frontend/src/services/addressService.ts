// src/services/addressService.ts
import api from "./api";

export interface Address {
    _id?: string;
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault?: boolean;
}

export const addressService = {
    // Get all addresses
    getAddresses: async (): Promise<{ success: boolean; data: { addresses: Address[] } }> => {
        try {
            const response = await api.get("/api/user/profile");
            return {
                success: response.data.success,
                data: { addresses: response.data.data.addresses || [] },
            };
        } catch (error) {
            console.error("Error fetching addresses:", error);
            throw error;
        }
    },

    // Add new address
    addAddress: async (
        addressData: Address
    ): Promise<{ success: boolean; data: { addresses: Address[] }; message: string }> => {
        try {
            const response = await api.post("/api/user/addresses", addressData);
            return response.data;
        } catch (error) {
            console.error("Error adding address:", error);
            throw error;
        }
    },

    // Update address
    updateAddress: async (
        addressId: string,
        addressData: Address
    ): Promise<{ success: boolean; data: { addresses: Address[] }; message: string }> => {
        try {
            const response = await api.put(`/api/user/addresses/${addressId}`, addressData);
            return response.data;
        } catch (error) {
            console.error("Error updating address:", error);
            throw error;
        }
    },

    // Delete address
    deleteAddress: async (
        addressId: string
    ): Promise<{ success: boolean; data: { addresses: Address[] }; message: string }> => {
        try {
            const response = await api.delete(`/api/user/addresses/${addressId}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting address:", error);
            throw error;
        }
    },

    // Set default address
    setDefaultAddress: async (
        addressId: string
    ): Promise<{ success: boolean; data: { addresses: Address[] }; message: string }> => {
        try {
            const response = await api.patch(`/api/user/addresses/${addressId}/default`);
            return response.data;
        } catch (error) {
            console.error("Error setting default address:", error);
            throw error;
        }
    },
};
