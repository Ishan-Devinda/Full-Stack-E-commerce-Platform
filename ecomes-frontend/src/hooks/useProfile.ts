// src/hooks/useProfile.ts
import { useState, useEffect } from "react";
import { userService, UserProfile, UpdateProfileData } from "@/services/userService";

interface UseProfileReturn {
    profile: UserProfile | null;
    loading: boolean;
    error: string | null;
    updateProfile: (data: UpdateProfileData) => Promise<void>;
    updateProfilePhoto: (publicId: string, url: string) => Promise<void>;
    refetch: () => Promise<void>;
}

export const useProfile = (): UseProfileReturn => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await userService.getProfile();
            if (response.success) {
                setProfile(response.data);
            } else {
                setError("Failed to fetch profile");
            }
        } catch (err: any) {
            console.error("Error fetching profile:", err);
            setError(err.message || "An error occurred while fetching profile");
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (data: UpdateProfileData) => {
        try {
            setError(null);
            const response = await userService.updateProfile(data);
            if (response.success) {
                setProfile(response.data);
            }
        } catch (err: any) {
            console.error("Error updating profile:", err);
            setError(err.message || "An error occurred while updating profile");
            throw err;
        }
    };

    const updateProfilePhoto = async (publicId: string, url: string) => {
        try {
            setError(null);
            const response = await userService.updateProfilePhoto(publicId, url);
            if (response.success) {
                setProfile(response.data);
            }
        } catch (err: any) {
            console.error("Error updating profile photo:", err);
            setError(err.message || "An error occurred while updating photo");
            throw err;
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    return {
        profile,
        loading,
        error,
        updateProfile,
        updateProfilePhoto,
        refetch: fetchProfile,
    };
};
