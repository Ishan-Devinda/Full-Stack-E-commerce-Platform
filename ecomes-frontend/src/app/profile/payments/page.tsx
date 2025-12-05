// src/app/profile/payments/page.tsx
"use client";

import React from "react";
import ProfileLayout from "@/components/profile/ProfileLayout";
import PaymentHistory from "@/components/profile/PaymentHistory";

export default function PaymentsPage() {
    return (
        <ProfileLayout>
            <PaymentHistory />
        </ProfileLayout>
    );
}
