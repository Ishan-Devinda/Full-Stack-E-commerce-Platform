// src/components/profile/PaymentHistory.tsx
"use client";

import React, { useState } from "react";
import { usePaymentHistory } from "@/hooks/usePaymentHistory";
import { Loader2, CreditCard } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { themeConfig } from "@/lib/theme";
import { Pagination } from "antd";

const PaymentHistory: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const { payments, loading, pagination, fetchPayments } = usePaymentHistory(currentPage, 10);
    const { theme } = useTheme();
    const t = themeConfig[theme];

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchPayments(page);
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
            <h2 className="text-2xl font-bold">Payment History</h2>

            {payments.length === 0 ? (
                <div className={`${t.card} rounded-lg p-12 text-center`}>
                    <CreditCard className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className={t.textSecondary}>No payments yet</p>
                </div>
            ) : (
                <>
                    <div className={`${t.card} rounded-lg overflow-hidden ${t.shadow}`}>
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Payment ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Method
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {payments.map((payment) => (
                                    <tr key={payment._id} className={t.hover}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {payment.paymentId.slice(-12)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {new Date(payment.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            ${payment.amount.toFixed(2)} {payment.currency}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                                            {payment.paymentMethod}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 text-xs rounded ${payment.status === "succeeded"
                                                        ? "bg-green-100 text-green-800"
                                                        : payment.status === "pending"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                {payment.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex justify-center mt-8">
                            <Pagination
                                current={pagination.currentPage}
                                total={pagination.totalPayments}
                                pageSize={10}
                                onChange={handlePageChange}
                                showSizeChanger={false}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PaymentHistory;
