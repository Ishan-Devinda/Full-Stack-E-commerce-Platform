"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import FileUpload from "@/components/admin/FileUpload";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { adminProductAPI } from "@/services/adminApi";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function CreateProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        shortDescription: "",
        category: "",
        subcategory: "",
        brand: "",
        basePrice: "",
        salePrice: "",
        currency: "USD",
        images: [] as string[],
        videos: [] as string[],
        image360: [] as string[],
        variants: [] as any[],
        specifications: {} as Record<string, any>,
        features: [] as string[],
        tags: [] as string[],
        stock: "",
        lowStockThreshold: "5",
        weight: "",
        dimensions: { length: "", width: "", height: "", unit: "cm" },
        offers: { discountPercentage: "", isOnSale: false, saleEndDate: "", freeShipping: false },
        shipping: { weight: "", dimensions: { length: "", width: "", height: "" }, freeShippingEligible: false, shippingCost: "" },
        company: { name: "", description: "", contactEmail: "", website: "", logo: "", aboutPdf: "" },
        productDocuments: [] as any[],
        seo: { metaTitle: "", metaDescription: "", slug: "", keywords: [] as string[] },
        status: "draft",
    });

    const [newFeature, setNewFeature] = useState("");
    const [newTag, setNewTag] = useState("");
    const [newKeyword, setNewKeyword] = useState("");
    const [newSpecKey, setNewSpecKey] = useState("");
    const [newSpecValue, setNewSpecValue] = useState("");

    const categories = ["electronics", "clothing", "shoes", "furniture", "home-appliances", "phones", "laptops", "accessories", "jewelry-watches"];

    const handleChange = (field: string, value: any) => setFormData((prev) => ({ ...prev, [field]: value }));
    const handleNestedChange = (parent: string, field: string, value: any) => setFormData((prev) => ({ ...prev, [parent]: { ...(prev as any)[parent], [field]: value } }));
    const handleDoubleNestedChange = (parent: string, nested: string, field: string, value: any) => setFormData((prev) => ({ ...prev, [parent]: { ...(prev as any)[parent], [nested]: { ...(prev as any)[parent][nested], [field]: value } } }));

    const addFeature = () => { if (newFeature.trim()) { setFormData((prev) => ({ ...prev, features: [...prev.features, newFeature.trim()] })); setNewFeature(""); } };
    const removeFeature = (index: number) => setFormData((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
    const addTag = () => { if (newTag.trim()) { setFormData((prev) => ({ ...prev, tags: [...prev.tags, newTag.trim()] })); setNewTag(""); } };
    const removeTag = (index: number) => setFormData((prev) => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) }));
    const addKeyword = () => { if (newKeyword.trim()) { setFormData((prev) => ({ ...prev, seo: { ...prev.seo, keywords: [...prev.seo.keywords, newKeyword.trim()] } })); setNewKeyword(""); } };
    const removeKeyword = (index: number) => setFormData((prev) => ({ ...prev, seo: { ...prev.seo, keywords: prev.seo.keywords.filter((_, i) => i !== index) } }));
    const addSpecification = () => { if (newSpecKey.trim() && newSpecValue.trim()) { setFormData((prev) => ({ ...prev, specifications: { ...prev.specifications, [newSpecKey.trim()]: newSpecValue.trim() } })); setNewSpecKey(""); setNewSpecValue(""); } };
    const removeSpecification = (key: string) => setFormData((prev) => { const newSpecs = { ...prev.specifications }; delete newSpecs[key]; return { ...prev, specifications: newSpecs }; });

    // Variant functions
    const addVariant = () => setFormData((prev) => ({ ...prev, variants: [...prev.variants, { color: "", size: "", sku: "", price: "", stock: "", images: [] }] }));
    const updateVariant = (index: number, field: string, value: any) => setFormData((prev) => ({ ...prev, variants: prev.variants.map((v, i) => i === index ? { ...v, [field]: value } : v) }));
    const removeVariant = (index: number) => setFormData((prev) => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }));

    // Document functions
    const addDocument = () => setFormData((prev) => ({ ...prev, productDocuments: [...prev.productDocuments, { name: "", type: "manual", fileUrl: "", fileSize: 0 }] }));
    const updateDocument = (index: number, field: string, value: any) => setFormData((prev) => ({ ...prev, productDocuments: prev.productDocuments.map((d, i) => i === index ? { ...d, [field]: value } : d) }));
    const removeDocument = (index: number) => setFormData((prev) => ({ ...prev, productDocuments: prev.productDocuments.filter((_, i) => i !== index) }));

    const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
        e.preventDefault();
        setLoading(true);

        try {
            const productData = {
                ...formData,
                basePrice: parseFloat(formData.basePrice) || 0,
                salePrice: formData.salePrice ? parseFloat(formData.salePrice) : undefined,
                stock: parseInt(formData.stock) || 0,
                lowStockThreshold: parseInt(formData.lowStockThreshold) || 5,
                weight: formData.weight ? parseFloat(formData.weight) : undefined,
                dimensions: {
                    ...formData.dimensions,
                    length: formData.dimensions.length ? parseFloat(formData.dimensions.length) : undefined,
                    width: formData.dimensions.width ? parseFloat(formData.dimensions.width) : undefined,
                    height: formData.dimensions.height ? parseFloat(formData.dimensions.height) : undefined,
                },
                shipping: {
                    ...formData.shipping,
                    weight: formData.shipping.weight ? parseFloat(formData.shipping.weight) : undefined,
                    shippingCost: formData.shipping.shippingCost ? parseFloat(formData.shipping.shippingCost) : 0,
                    dimensions: {
                        length: formData.shipping.dimensions.length ? parseFloat(formData.shipping.dimensions.length) : undefined,
                        width: formData.shipping.dimensions.width ? parseFloat(formData.shipping.dimensions.width) : undefined,
                        height: formData.shipping.dimensions.height ? parseFloat(formData.shipping.dimensions.height) : undefined,
                    },
                },
                offers: {
                    ...formData.offers,
                    discountPercentage: formData.offers.discountPercentage ? parseFloat(formData.offers.discountPercentage) : undefined,
                },
                variants: formData.variants.map((v) => ({
                    ...v,
                    price: v.price ? parseFloat(v.price) : undefined,
                    stock: v.stock ? parseInt(v.stock) : 0,
                })),
                productDocuments: formData.productDocuments.map((d) => ({
                    ...d,
                    fileSize: d.fileSize ? parseInt(d.fileSize) : 0,
                })),
                status: isDraft ? "draft" : "active",
            };

            await adminProductAPI.createProduct(productData);
            toast.success(`Product ${isDraft ? "saved as draft" : "created"} successfully!`);
            router.push("/admin/products");
        } catch (error: any) {
            console.error("Create product error:", error);
            toast.error(error.response?.data?.message || "Failed to create product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6 pb-12">
                {/* Header */}
                <div className="flex items-center justify-between sticky top-0 bg-gray-50 z-10 py-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Create Product</h1>
                        <p className="text-gray-600 mt-1">Add a new product to your catalog</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button type="button" onClick={(e) => handleSubmit(e as any, true)} disabled={loading} className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50">
                            Save as Draft
                        </button>
                        <button type="submit" disabled={loading} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50">
                            {loading ? "Creating..." : "Publish Product"}
                        </button>
                    </div>
                </div>

                {/* Basic Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                            <input type="text" required value={formData.name} onChange={(e) => handleChange("name", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Women's RoseGold Elegance Watch" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
                            <input type="text" value={formData.shortDescription} onChange={(e) => handleChange("shortDescription", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Elegant women's rose-gold watch" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                            <select required value={formData.category} onChange={(e) => handleChange("category", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                                <option value="">Select Category</option>
                                {categories.map((cat) => (<option key={cat} value={cat}>{cat.replace("-", " ").toUpperCase()}</option>))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory *</label>
                            <input type="text" required value={formData.subcategory} onChange={(e) => handleChange("subcategory", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="women-watches" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
                            <input type="text" required value={formData.brand} onChange={(e) => handleChange("brand", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="BellaTime" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Stock *</label>
                            <input type="number" required value={formData.stock} onChange={(e) => handleChange("stock", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="52" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Threshold</label>
                            <input type="number" value={formData.lowStockThreshold} onChange={(e) => handleChange("lowStockThreshold", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="5" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                            <input type="number" step="0.01" value={formData.weight} onChange={(e) => handleChange("weight", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="0.20" />
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <RichTextEditor label="Product Description *" value={formData.description} onChange={(value) => handleChange("description", value)} placeholder="Enter detailed product description with HTML formatting..." />
                </div>

                {/* Pricing */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Pricing</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Base Price * ($)</label>
                            <input type="number" step="0.01" required value={formData.basePrice} onChange={(e) => handleChange("basePrice", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="149.99" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price ($)</label>
                            <input type="number" step="0.01" value={formData.salePrice} onChange={(e) => handleChange("salePrice", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="119.99" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                            <select value={formData.currency} onChange={(e) => handleChange("currency", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Dimensions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Dimensions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Length</label>
                            <input type="number" step="0.01" value={formData.dimensions.length} onChange={(e) => handleNestedChange("dimensions", "length", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="10" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
                            <input type="number" step="0.01" value={formData.dimensions.width} onChange={(e) => handleNestedChange("dimensions", "width", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="8" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                            <input type="number" step="0.01" value={formData.dimensions.height} onChange={(e) => handleNestedChange("dimensions", "height", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="6" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                            <select value={formData.dimensions.unit} onChange={(e) => handleNestedChange("dimensions", "unit", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                                <option value="cm">cm</option>
                                <option value="in">in</option>
                                <option value="m">m</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Offers */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Offers & Promotions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Discount Percentage (%)</label>
                            <input type="number" step="0.01" value={formData.offers.discountPercentage} onChange={(e) => handleNestedChange("offers", "discountPercentage", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="25" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sale End Date</label>
                            <input type="datetime-local" value={formData.offers.saleEndDate} onChange={(e) => handleNestedChange("offers", "saleEndDate", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <input type="checkbox" id="isOnSale" checked={formData.offers.isOnSale} onChange={(e) => handleNestedChange("offers", "isOnSale", e.target.checked)} className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                            <label htmlFor="isOnSale" className="text-sm font-medium text-gray-700">Is On Sale</label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input type="checkbox" id="freeShipping" checked={formData.offers.freeShipping} onChange={(e) => handleNestedChange("offers", "freeShipping", e.target.checked)} className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                            <label htmlFor="freeShipping" className="text-sm font-medium text-gray-700">Free Shipping</label>
                        </div>
                    </div>
                </div>

                {/* Shipping */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Weight (kg)</label>
                            <input type="number" step="0.01" value={formData.shipping.weight} onChange={(e) => handleNestedChange("shipping", "weight", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="0.25" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Cost ($)</label>
                            <input type="number" step="0.01" value={formData.shipping.shippingCost} onChange={(e) => handleNestedChange("shipping", "shippingCost", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="0" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Package Length</label>
                            <input type="number" step="0.01" value={formData.shipping.dimensions.length} onChange={(e) => handleDoubleNestedChange("shipping", "dimensions", "length", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="14" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Package Width</label>
                            <input type="number" step="0.01" value={formData.shipping.dimensions.width} onChange={(e) => handleDoubleNestedChange("shipping", "dimensions", "width", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="10" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Package Height</label>
                            <input type="number" step="0.01" value={formData.shipping.dimensions.height} onChange={(e) => handleDoubleNestedChange("shipping", "dimensions", "height", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="7" />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id="freeShippingEligible" checked={formData.shipping.freeShippingEligible} onChange={(e) => handleNestedChange("shipping", "freeShippingEligible", e.target.checked)} className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                        <label htmlFor="freeShippingEligible" className="text-sm font-medium text-gray-700">Free Shipping Eligible</label>
                    </div>
                </div>

                {/* Media */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Product Media</h2>
                    <div className="space-y-6">
                        <div>
                            <FileUpload label="Product Images (Multiple)" multiple={true} accept="image/*" folder="products/images" maxFiles={10} onUploadComplete={(urls) => setFormData((prev) => ({ ...prev, images: [...prev.images, ...urls] }))} />
                            {formData.images.length > 0 && <p className="text-sm text-gray-600 mt-2">{formData.images.length} image(s) uploaded</p>}
                        </div>
                        <div>
                            <FileUpload label="Product Videos (Optional)" multiple={true} accept="video/*" folder="products/videos" maxFiles={5} onUploadComplete={(urls) => setFormData((prev) => ({ ...prev, videos: [...prev.videos, ...urls] }))} />
                            {formData.videos.length > 0 && <p className="text-sm text-gray-600 mt-2">{formData.videos.length} video(s) uploaded</p>}
                        </div>
                        <div>
                            <FileUpload label="360° Images (Optional)" multiple={true} accept="image/*" folder="products/360" maxFiles={20} onUploadComplete={(urls) => setFormData((prev) => ({ ...prev, image360: [...prev.image360, ...urls] }))} />
                            {formData.image360.length > 0 && <p className="text-sm text-gray-600 mt-2">{formData.image360.length} 360° image(s) uploaded</p>}
                        </div>
                    </div>
                </div>

                {/* Product Variants */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Product Variants</h2>
                        <button type="button" onClick={addVariant} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Add Variant</button>
                    </div>
                    {formData.variants.length === 0 ? (
                        <p className="text-gray-500 text-sm">No variants added. Click "Add Variant" to create product variations.</p>
                    ) : (
                        <div className="space-y-4">
                            {formData.variants.map((variant, index) => (
                                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold text-gray-900">Variant {index + 1}</h3>
                                        <button type="button" onClick={() => removeVariant(index)} className="text-red-600 hover:text-red-800">Remove</button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                                            <input type="text" value={variant.color} onChange={(e) => updateVariant(index, "color", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Rose Gold" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                                            <input type="text" value={variant.size} onChange={(e) => updateVariant(index, "size", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Slim" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                                            <input type="text" value={variant.sku} onChange={(e) => updateVariant(index, "sku", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="BT-RG-01" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                                            <input type="number" step="0.01" value={variant.price} onChange={(e) => updateVariant(index, "price", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="119.99" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                                            <input type="number" value={variant.stock} onChange={(e) => updateVariant(index, "stock", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="32" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Variant Images</label>
                                            <FileUpload label="" multiple={true} accept="image/*" folder="products/variants" maxFiles={5} onUploadComplete={(urls) => updateVariant(index, "images", [...variant.images, ...urls])} />
                                            {variant.images && variant.images.length > 0 && <p className="text-xs text-gray-500 mt-1">{variant.images.length} image(s)</p>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Documents */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Product Documents</h2>
                        <button type="button" onClick={addDocument} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Add Document</button>
                    </div>
                    {formData.productDocuments.length === 0 ? (
                        <p className="text-gray-500 text-sm">No documents added. Click "Add Document" to upload manuals, specifications, etc.</p>
                    ) : (
                        <div className="space-y-4">
                            {formData.productDocuments.map((doc, index) => (
                                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold text-gray-900">Document {index + 1}</h3>
                                        <button type="button" onClick={() => removeDocument(index)} className="text-red-600 hover:text-red-800">Remove</button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Document Name</label>
                                            <input type="text" value={doc.name} onChange={(e) => updateDocument(index, "name", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Care Instructions" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                                            <select value={doc.type} onChange={(e) => updateDocument(index, "type", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                                                <option value="manual">Manual</option>
                                                <option value="specification">Specification</option>
                                                <option value="warranty">Warranty</option>
                                                <option value="certificate">Certificate</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Document (PDF)</label>
                                            <FileUpload label="" multiple={false} accept=".pdf,.doc,.docx" folder="products/documents" maxFiles={1} onUploadComplete={(urls) => {
                                                updateDocument(index, "fileUrl", urls[0]);
                                                // Estimate file size (you can get this from upload response if available)
                                                updateDocument(index, "fileSize", 750);
                                            }} />
                                            {doc.fileUrl && <p className="text-xs text-gray-500 mt-1">✓ File uploaded</p>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Company Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Company Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                            <input type="text" value={formData.company.name} onChange={(e) => handleNestedChange("company", "name", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="BellaTime" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                            <input type="email" value={formData.company.contactEmail} onChange={(e) => handleNestedChange("company", "contactEmail", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="info@bellatime.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                            <input type="url" value={formData.company.website} onChange={(e) => handleNestedChange("company", "website", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="https://bellatime.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                            <FileUpload label="" multiple={false} accept="image/*" folder="company/logos" maxFiles={1} onUploadComplete={(urls) => handleNestedChange("company", "logo", urls[0])} />
                            {formData.company.logo && <p className="text-xs text-gray-500 mt-1">✓ Logo uploaded</p>}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Company Description</label>
                            <textarea value={formData.company.description} onChange={(e) => handleNestedChange("company", "description", e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="A brand specializing in elegant watches..." />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">About PDF</label>
                            <FileUpload label="" multiple={false} accept=".pdf" folder="company/about" maxFiles={1} onUploadComplete={(urls) => handleNestedChange("company", "aboutPdf", urls[0])} />
                            {formData.company.aboutPdf && <p className="text-xs text-gray-500 mt-1">✓ PDF uploaded</p>}
                        </div>
                    </div>
                </div>

                {/* Specifications */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Specifications</h2>
                    <div className="flex gap-4 mb-4">
                        <input type="text" value={newSpecKey} onChange={(e) => setNewSpecKey(e.target.value)} placeholder="Key (e.g., movement)" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        <input type="text" value={newSpecValue} onChange={(e) => setNewSpecValue(e.target.value)} placeholder="Value (e.g., Quartz)" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        <button type="button" onClick={addSpecification} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Add</button>
                    </div>
                    <div className="space-y-2">
                        {Object.entries(formData.specifications).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm"><strong>{key}:</strong> {value}</span>
                                <button type="button" onClick={() => removeSpecification(key)} className="text-red-600 hover:text-red-800">Remove</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Features */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Features</h2>
                    <div className="flex gap-4 mb-4">
                        <input type="text" value={newFeature} onChange={(e) => setNewFeature(e.target.value)} placeholder="Add feature" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        <button type="button" onClick={addFeature} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.features.map((feature, index) => (
                            <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-2">
                                {feature}
                                <button type="button" onClick={() => removeFeature(index)} className="text-purple-600 hover:text-purple-800">×</button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Tags */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Tags</h2>
                    <div className="flex gap-4 mb-4">
                        <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Add tag" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        <button type="button" onClick={addTag} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2">
                                {tag}
                                <button type="button" onClick={() => removeTag(index)} className="text-blue-600 hover:text-blue-800">×</button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* SEO */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">SEO Settings</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                            <input type="text" value={formData.seo.metaTitle} onChange={(e) => handleNestedChange("seo", "metaTitle", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                            <textarea value={formData.seo.metaDescription} onChange={(e) => handleNestedChange("seo", "metaDescription", e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">URL Slug</label>
                            <input type="text" value={formData.seo.slug} onChange={(e) => handleNestedChange("seo", "slug", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="womens-rosegold-elegance-watch" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
                            <div className="flex gap-4 mb-2">
                                <input type="text" value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} placeholder="Add keyword" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                <button type="button" onClick={addKeyword} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Add</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.seo.keywords.map((keyword, index) => (
                                    <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2">
                                        {keyword}
                                        <button type="button" onClick={() => removeKeyword(index)} className="text-green-600 hover:text-green-800">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}
