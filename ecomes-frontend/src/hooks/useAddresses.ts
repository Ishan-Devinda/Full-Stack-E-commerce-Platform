// src/hooks/useAddresses.ts
import { useState, useEffect } from "react";
import { addressService, Address } from "@/services/addressService";

interface UseAddressesReturn {
    addresses: Address[];
    loading: boolean;
    error: string | null;
    addAddress: (data: Address) => Promise<void>;
    updateAddress: (id: string, data: Address) => Promise<void>;
    deleteAddress: (id: string) => Promise<void>;
    setDefaultAddress: (id: string) => Promise<void>;
    refetch: () => Promise<void>;
}

export const useAddresses = (): UseAddressesReturn => {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await addressService.getAddresses();
            if (response.success) {
                setAddresses(response.data.addresses);
            } else {
                setError("Failed to fetch addresses");
            }
        } catch (err: any) {
            console.error("Error fetching addresses:", err);
            setError(err.message || "An error occurred while fetching addresses");
        } finally {
            setLoading(false);
        }
    };

    const addAddress = async (data: Address) => {
        try {
            setError(null);
            const response = await addressService.addAddress(data);
            if (response.success) {
                setAddresses(response.data.addresses);
            }
        } catch (err: any) {
            console.error("Error adding address:", err);
            setError(err.message || "An error occurred while adding address");
            throw err;
        }
    };

    const updateAddress = async (id: string, data: Address) => {
        try {
            setError(null);
            const response = await addressService.updateAddress(id, data);
            if (response.success) {
                setAddresses(response.data.addresses);
            }
        } catch (err: any) {
            console.error("Error updating address:", err);
            setError(err.message || "An error occurred while updating address");
            throw err;
        }
    };

    const deleteAddress = async (id: string) => {
        try {
            setError(null);
            const response = await addressService.deleteAddress(id);
            if (response.success) {
                setAddresses(response.data.addresses);
            }
        } catch (err: any) {
            console.error("Error deleting address:", err);
            setError(err.message || "An error occurred while deleting address");
            throw err;
        }
    };

    const setDefaultAddress = async (id: string) => {
        try {
            setError(null);
            const response = await addressService.setDefaultAddress(id);
            if (response.success) {
                setAddresses(response.data.addresses);
            }
        } catch (err: any) {
            console.error("Error setting default address:", err);
            setError(err.message || "An error occurred while setting default address");
            throw err;
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    return {
        addresses,
        loading,
        error,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        refetch: fetchAddresses,
    };
};
