// src/services/userService.ts
import api from "./api";

export interface UserProfile {
    _id: string;
    email: string;
    username: string;
    profile: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        dateOfBirth?: string;
        gender?: string;
        bio?: string;
        avatar?: {
            publicId: string;
            url: string;
        };
        preferences?: {
            language?: string;
            currency?: string;
            notifications?: boolean;
        };
    };
    addresses: Address[];
    wishlist: any[];
    cart: any;
    createdAt: string;
    updatedAt: string;
}

export interface Address {
    _id: string;
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
}

export interface UpdateProfileData {
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    bio?: string;
    preferences?: {
        language?: string;
        currency?: string;
        notifications?: boolean;
    };
}

export const userService = {
    // Get user profile
    getProfile: async (): Promise<{ success: boolean; data: UserProfile }> => {
        try {
            const response = await api.get("/api/user/profile");
            return response.data;
        } catch (error) {
            console.error("Error fetching profile:", error);
            throw error;
        }
    },

    // Update user profile
    updateProfile: async (
        data: UpdateProfileData
    ): Promise<{ success: boolean; data: UserProfile; message: string }> => {
        try {
            const response = await api.put("/api/user/profile", data);
            return response.data;
        } catch (error) {
            console.error("Error updating profile:", error);
            throw error;
        }
    },

    // Update profile photo
    updateProfilePhoto: async (
        publicId: string,
        url: string
    ): Promise<{ success: boolean; data: UserProfile; message: string }> => {
        try {
            const response = await api.put("/api/user/profile/photo", {
                publicId,
                url,
            });
            return response.data;
        } catch (error) {
            console.error("Error updating profile photo:", error);
            throw error;
        }
    },
};
