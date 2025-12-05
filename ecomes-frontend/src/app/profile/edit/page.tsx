// src/app/profile/edit/page.tsx
"use client";

import React from "react";
import ProfileLayout from "@/components/profile/ProfileLayout";
import ProfileEdit from "@/components/profile/ProfileEdit";

export default function ProfileEditPage() {
    return (
        <ProfileLayout>
            <ProfileEdit />
        </ProfileLayout>
    );
}
