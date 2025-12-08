import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance for admin operations
const adminAxios = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
adminAxios.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('adminAccessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Admin authentication
export const adminAuthAPI = {
    login: async (email: string, password: string) => {
        const response = await axios.post(`${API_URL}/admin/auth/login`, {
            email,
            password,
        });
        return response.data;
    },

    logout: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('adminAccessToken');
            localStorage.removeItem('adminRefreshToken');
            localStorage.removeItem('adminUser');
        }
    },

    getCurrentUser: () => {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('adminUser');
            return userStr ? JSON.parse(userStr) : null;
        }
        return null;
    },

    isAuthenticated: () => {
        if (typeof window !== 'undefined') {
            return !!localStorage.getItem('adminAccessToken');
        }
        return false;
    },
};

// Product management
export const adminProductAPI = {
    // Get all products with filters
    getProducts: async (params?: {
        page?: number;
        limit?: number;
        category?: string;
        status?: string;
        search?: string;
    }) => {
        const response = await adminAxios.get('/api/products', { params });
        return response.data;
    },

    // Get single product
    getProduct: async (id: string) => {
        const response = await adminAxios.get(`/api/products/${id}`);
        return response.data;
    },

    // Create product
    createProduct: async (productData: any) => {
        const response = await adminAxios.post('/api/products', productData);
        return response.data;
    },

    // Update product
    updateProduct: async (id: string, productData: any) => {
        const response = await adminAxios.put(`/api/products/${id}`, productData);
        return response.data;
    },

    // Delete product
    deleteProduct: async (id: string) => {
        const response = await adminAxios.delete(`/api/products/${id}`);
        return response.data;
    },
};

// File upload
export const adminUploadAPI = {
    // Upload single file
    uploadSingle: async (file: File, folder: string = 'products') => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const response = await adminAxios.post('/upload/single', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Upload multiple files
    uploadMultiple: async (files: File[], folder: string = 'products') => {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
        });
        formData.append('folder', folder);

        const response = await adminAxios.post('/upload/multiple', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Delete file
    deleteFile: async (publicId: string) => {
        const response = await adminAxios.delete(`/upload?publicId=${publicId}`);
        return response.data;
    },
};

export default {
    auth: adminAuthAPI,
    products: adminProductAPI,
    upload: adminUploadAPI,
};
