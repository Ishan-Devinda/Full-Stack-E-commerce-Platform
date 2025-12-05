// src/app/profile/orders/page.tsx
"use client";

import React from "react";
import ProfileLayout from "@/components/profile/ProfileLayout";
import OrderHistory from "@/components/profile/OrderHistory";

export default function OrdersPage() {
    return (
        <ProfileLayout>
            <OrderHistory />
        </ProfileLayout>
    );
}
