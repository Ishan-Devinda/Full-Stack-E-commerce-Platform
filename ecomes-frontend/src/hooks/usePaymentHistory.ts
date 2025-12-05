// src/hooks/usePaymentHistory.ts
import { useState, useEffect } from "react";
import { paymentHistoryService, Payment } from "@/services/paymentHistoryService";

interface UsePaymentHistoryReturn {
    payments: Payment[];
    loading: boolean;
    error: string | null;
    pagination: {
        currentPage: number;
        totalPages: number;
        totalPayments: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    } | null;
    fetchPayments: (page: number) => Promise<void>;
    refetch: () => Promise<void>;
}

export const usePaymentHistory = (
    initialPage: number = 1,
    limit: number = 10
): UsePaymentHistoryReturn => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<UsePaymentHistoryReturn["pagination"]>(null);
    const [currentPage, setCurrentPage] = useState(initialPage);

    const fetchPayments = async (page: number) => {
        try {
            setLoading(true);
            setError(null);
            const response = await paymentHistoryService.getPaymentHistory(page, limit);
            if (response.success) {
                setPayments(response.data.payments);
                setPagination(response.data.pagination);
                setCurrentPage(page);
            } else {
                setError("Failed to fetch payment history");
            }
        } catch (err: any) {
            console.error("Error fetching payment history:", err);
            setError(err.message || "An error occurred while fetching payment history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments(currentPage);
    }, []);

    return {
        payments,
        loading,
        error,
        pagination,
        fetchPayments,
        refetch: () => fetchPayments(currentPage),
    };
};
