// src/hooks/useOrders.ts
import { useState, useEffect } from "react";
import { orderService, Order } from "@/services/orderService";

interface UseOrdersReturn {
    orders: Order[];
    loading: boolean;
    error: string | null;
    pagination: {
        currentPage: number;
        totalPages: number;
        totalOrders: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    } | null;
    fetchOrders: (page: number) => Promise<void>;
    refetch: () => Promise<void>;
}

export const useOrders = (initialPage: number = 1, limit: number = 10): UseOrdersReturn => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<UseOrdersReturn["pagination"]>(null);
    const [currentPage, setCurrentPage] = useState(initialPage);

    const fetchOrders = async (page: number) => {
        try {
            setLoading(true);
            setError(null);
            const response = await orderService.getOrders(page, limit);
            if (response.success) {
                setOrders(response.data.orders);
                setPagination(response.data.pagination);
                setCurrentPage(page);
            } else {
                setError("Failed to fetch orders");
            }
        } catch (err: any) {
            console.error("Error fetching orders:", err);
            setError(err.message || "An error occurred while fetching orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(currentPage);
    }, []);

    return {
        orders,
        loading,
        error,
        pagination,
        fetchOrders,
        refetch: () => fetchOrders(currentPage),
    };
};
