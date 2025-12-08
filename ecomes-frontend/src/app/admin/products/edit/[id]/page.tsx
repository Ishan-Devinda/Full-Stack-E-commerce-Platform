"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import FileUpload from "@/components/admin/FileUpload";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { adminProductAPI } from "@/services/adminApi";
import { toast } from "react-hot-toast";

export default function EditProductPage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<any>(null);

    useEffect(() => {
        if (params.id) {
            fetchProduct();
        }
    }, [params.id]);

    const fetchProduct = async () => {
        try {
            const response = await adminProductAPI.getProduct(params.id as string);
            setFormData(response.data);
        } catch (error: any) {
            console.error("Fetch product error:", error);
            toast.error("Failed to load product");
            router.push("/admin/products");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            await adminProductAPI.updateProduct(params.id as string, formData);
            toast.success("Product updated successfully!");
            router.push("/admin/products");
        } catch (error: any) {
            console.error("Update product error:", error);
            toast.error(error.response?.data?.message || "Failed to update product");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            </AdminLayout>
        );
    }

    if (!formData) {
        return (
            <AdminLayout>
                <div className="text-center py-12">
                    <p className="text-gray-500">Product not found</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <form onSubmit={handleSubmit} className="space-y-6 pb-12">
                {/* Header */}
                <div className="flex items-center justify-between sticky top-0 bg-gray-50 z-10 py-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
                        <p className="text-gray-600 mt-1">Update product information</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            type="button"
                            onClick={() => router.push("/admin/products")}
                            className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>

                {/* Basic Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                            <input
                                type="text"
                                required
                                value={formData.name || ""}
                                onChange={(e) => handleChange("name", e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                            <input
                                type="text"
                                required
                                value={formData.category || ""}
                                onChange={(e) => handleChange("category", e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
                            <input
                                type="text"
                                required
                                value={formData.brand || ""}
                                onChange={(e) => handleChange("brand", e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Stock *</label>
                            <input
                                type="number"
                                required
                                value={formData.stock || 0}
                                onChange={(e) => handleChange("stock", parseInt(e.target.value))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={formData.status || "active"}
                                onChange={(e) => handleChange("status", e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="draft">Draft</option>
                                <option value="out-of-stock">Out of Stock</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <RichTextEditor
                        label="Product Description *"
                        value={formData.description || ""}
                        onChange={(value) => handleChange("description", value)}
                    />
                </div>

                {/* Pricing */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Pricing</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Base Price * ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={formData.basePrice || ""}
                                onChange={(e) => handleChange("basePrice", parseFloat(e.target.value))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.salePrice || ""}
                                onChange={(e) => handleChange("salePrice", e.target.value ? parseFloat(e.target.value) : null)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Current Images */}
                {formData.images && formData.images.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Current Images</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {formData.images.map((url: string, index: number) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={url}
                                        alt={`Product ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newImages = formData.images.filter((_: any, i: number) => i !== index);
                                            handleChange("images", newImages);
                                        }}
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Add More Images */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Add More Images</h2>
                    <FileUpload
                        label="Upload Additional Images"
                        multiple={true}
                        accept="image/*"
                        folder="products/images"
                        maxFiles={10}
                        onUploadComplete={(urls) => {
                            handleChange("images", [...(formData.images || []), ...urls]);
                        }}
                    />
                </div>
            </form>
        </AdminLayout>
    );
}
