// src/app/profile/addresses/page.tsx
"use client";

import React from "react";
import ProfileLayout from "@/components/profile/ProfileLayout";
import AddressManager from "@/components/profile/AddressManager";

export default function AddressesPage() {
    return (
        <ProfileLayout>
            <AddressManager />
        </ProfileLayout>
    );
}
