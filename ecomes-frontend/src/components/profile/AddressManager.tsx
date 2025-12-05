// src/components/profile/AddressManager.tsx
"use client";

import React, { useState } from "react";
import { useAddresses } from "@/hooks/useAddresses";
import { Plus, Edit, Trash2, Check, Loader2 } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { themeConfig } from "@/lib/theme";
import { message, Modal } from "antd";
import AddressForm from "./AddressForm";
import { Address } from "@/services/addressService";

const AddressManager: React.FC = () => {
    const { addresses, loading, deleteAddress, setDefaultAddress } = useAddresses();
    const { theme } = useTheme();
    const t = themeConfig[theme];

    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    const handleDelete = async (id: string) => {
        Modal.confirm({
            title: "Delete Address",
            content: "Are you sure you want to delete this address?",
            onOk: async () => {
                try {
                    await deleteAddress(id);
                    message.success("Address deleted successfully");
                } catch (error) {
                    message.error("Failed to delete address");
                }
            },
        });
    };

    const handleSetDefault = async (id: string) => {
        try {
            await setDefaultAddress(id);
            message.success("Default address updated");
        } catch (error) {
            message.error("Failed to set default address");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">My Addresses</h2>
                <button
                    onClick={() => {
                        setEditingAddress(null);
                        setShowForm(true);
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Address
                </button>
            </div>

            {showForm && (
                <AddressForm
                    address={editingAddress}
                    onClose={() => {
                        setShowForm(false);
                        setEditingAddress(null);
                    }}
                />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((address) => (
                    <div
                        key={address._id}
                        className={`${t.card} rounded-lg p-6 ${t.shadow} relative`}
                    >
                        {address.isDefault && (
                            <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                Default
                            </div>
                        )}

                        <h3 className="font-semibold text-lg mb-2">{address.fullName}</h3>
                        <p className={t.textSecondary}>{address.addressLine1}</p>
                        {address.addressLine2 && <p className={t.textSecondary}>{address.addressLine2}</p>}
                        <p className={t.textSecondary}>
                            {address.city}, {address.state} {address.postalCode}
                        </p>
                        <p className={t.textSecondary}>{address.country}</p>
                        <p className={`${t.textSecondary} mt-2`}>{address.phone}</p>

                        <div className="flex space-x-2 mt-4">
                            {!address.isDefault && (
                                <button
                                    onClick={() => handleSetDefault(address._id!)}
                                    className="flex items-center text-sm text-blue-500 hover:text-blue-600"
                                >
                                    <Check className="h-4 w-4 mr-1" />
                                    Set Default
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setEditingAddress(address);
                                    setShowForm(true);
                                }}
                                className="flex items-center text-sm text-gray-500 hover:text-gray-600"
                            >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(address._id!)}
                                className="flex items-center text-sm text-red-500 hover:text-red-600"
                            >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {addresses.length === 0 && (
                <div className={`${t.card} rounded-lg p-12 text-center`}>
                    <p className={t.textSecondary}>No addresses saved yet</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="mt-4 text-blue-500 hover:text-blue-600"
                    >
                        Add your first address
                    </button>
                </div>
            )}
        </div>
    );
};

export default AddressManager;
