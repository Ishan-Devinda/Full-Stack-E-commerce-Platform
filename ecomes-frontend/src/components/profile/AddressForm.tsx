// src/components/profile/AddressForm.tsx
"use client";

import React, { useState } from "react";
import { useAddresses } from "@/hooks/useAddresses";
import { Loader2, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { themeConfig } from "@/lib/theme";
import { message } from "antd";
import { Address } from "@/services/addressService";

interface AddressFormProps {
    address?: Address | null;
    onClose: () => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ address, onClose }) => {
    const { addAddress, updateAddress } = useAddresses();
    const { theme } = useTheme();
    const t = themeConfig[theme];

    const [formData, setFormData] = useState<Address>({
        fullName: address?.fullName || "",
        phone: address?.phone || "",
        addressLine1: address?.addressLine1 || "",
        addressLine2: address?.addressLine2 || "",
        city: address?.city || "",
        state: address?.state || "",
        postalCode: address?.postalCode || "",
        country: address?.country || "",
        isDefault: address?.isDefault || false,
    });

    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (address?._id) {
                await updateAddress(address._id, formData);
                message.success("Address updated successfully");
            } else {
                await addAddress(formData);
                message.success("Address added successfully");
            }
            onClose();
        } catch (error) {
            message.error("Failed to save address");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={`${t.card} rounded-lg p-6 ${t.shadow}`}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">
                    {address ? "Edit Address" : "Add New Address"}
                </h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                    <X className="h-6 w-6" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Full Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className={`w-full px-4 py-2 rounded-lg border ${t.border} ${t.bg} ${t.text}`}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Phone *</label>
                        <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className={`w-full px-4 py-2 rounded-lg border ${t.border} ${t.bg} ${t.text}`}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Address Line 1 *</label>
                    <input
                        type="text"
                        required
                        value={formData.addressLine1}
                        onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${t.border} ${t.bg} ${t.text}`}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Address Line 2</label>
                    <input
                        type="text"
                        value={formData.addressLine2}
                        onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${t.border} ${t.bg} ${t.text}`}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">City *</label>
                        <input
                            type="text"
                            required
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className={`w-full px-4 py-2 rounded-lg border ${t.border} ${t.bg} ${t.text}`}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">State *</label>
                        <input
                            type="text"
                            required
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            className={`w-full px-4 py-2 rounded-lg border ${t.border} ${t.bg} ${t.text}`}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Postal Code *</label>
                        <input
                            type="text"
                            required
                            value={formData.postalCode}
                            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                            className={`w-full px-4 py-2 rounded-lg border ${t.border} ${t.bg} ${t.text}`}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Country *</label>
                    <input
                        type="text"
                        required
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${t.border} ${t.bg} ${t.text}`}
                    />
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="isDefault"
                        checked={formData.isDefault}
                        onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                        className="mr-2"
                    />
                    <label htmlFor="isDefault" className="text-sm">
                        Set as default address
                    </label>
                </div>

                <div className="flex space-x-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 flex items-center"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Address"
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddressForm;
