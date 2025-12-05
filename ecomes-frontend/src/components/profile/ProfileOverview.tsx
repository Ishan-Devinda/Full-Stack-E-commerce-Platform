// src/components/profile/ProfileOverview.tsx
"use client";

import React from "react";
import { useProfile } from "@/hooks/useProfile";
import { Loader2, Mail, Phone, Calendar, MapPin } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { themeConfig } from "@/lib/theme";
import Image from "next/image";

const ProfileOverview: React.FC = () => {
    const { profile, loading, error } = useProfile();
    const { theme } = useTheme();
    const t = themeConfig[theme];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className={`${t.card} rounded-lg p-8 text-center`}>
                <p className="text-red-500">{error || "Failed to load profile"}</p>
            </div>
        );
    }

    const defaultAddress = profile.addresses.find((addr) => addr.isDefault);

    return (
        <div className="space-y-6">
            {/* Profile Header */}
            <div className={`${t.card} rounded-lg p-8 ${t.shadow}`}>
                <div className="flex items-center space-x-6">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                        {profile.profile.avatar?.url ? (
                            <Image
                                src={profile.profile.avatar.url}
                                alt="Profile"
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400">
                                {profile.profile.firstName?.[0] || profile.username[0].toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold">
                            {profile.profile.firstName && profile.profile.lastName
                                ? `${profile.profile.firstName} ${profile.profile.lastName}`
                                : profile.username}
                        </h2>
                        <p className={`${t.textSecondary} flex items-center mt-1`}>
                            <Mail className="h-4 w-4 mr-2" />
                            {profile.email}
                        </p>
                    </div>
                </div>
            </div>

            {/* Profile Details */}
            <div className={`${t.card} rounded-lg p-8 ${t.shadow}`}>
                <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.profile.phone && (
                        <div className="flex items-center space-x-3">
                            <Phone className="h-5 w-5 text-gray-400" />
                            <div>
                                <p className={`text-sm ${t.textSecondary}`}>Phone</p>
                                <p className="font-medium">{profile.profile.phone}</p>
                            </div>
                        </div>
                    )}

                    {profile.profile.dateOfBirth && (
                        <div className="flex items-center space-x-3">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <div>
                                <p className={`text-sm ${t.textSecondary}`}>Date of Birth</p>
                                <p className="font-medium">
                                    {new Date(profile.profile.dateOfBirth).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {profile.profile.bio && (
                    <div className="mt-4">
                        <p className={`text-sm ${t.textSecondary}`}>Bio</p>
                        <p className="mt-1">{profile.profile.bio}</p>
                    </div>
                )}
            </div>

            {/* Default Address */}
            {defaultAddress && (
                <div className={`${t.card} rounded-lg p-8 ${t.shadow}`}>
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                        <MapPin className="h-5 w-5 mr-2" />
                        Default Address
                    </h3>
                    <div>
                        <p className="font-medium">{defaultAddress.fullName}</p>
                        <p className={t.textSecondary}>{defaultAddress.addressLine1}</p>
                        {defaultAddress.addressLine2 && (
                            <p className={t.textSecondary}>{defaultAddress.addressLine2}</p>
                        )}
                        <p className={t.textSecondary}>
                            {defaultAddress.city}, {defaultAddress.state} {defaultAddress.postalCode}
                        </p>
                        <p className={t.textSecondary}>{defaultAddress.country}</p>
                        <p className={`${t.textSecondary} mt-2`}>{defaultAddress.phone}</p>
                    </div>
                </div>
            )}

            {/* Account Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`${t.card} rounded-lg p-6 ${t.shadow} text-center`}>
                    <p className={`text-3xl font-bold text-blue-500`}>{profile.wishlist.length}</p>
                    <p className={`${t.textSecondary} mt-2`}>Wishlist Items</p>
                </div>
                <div className={`${t.card} rounded-lg p-6 ${t.shadow} text-center`}>
                    <p className={`text-3xl font-bold text-green-500`}>
                        {profile.cart.items?.length || 0}
                    </p>
                    <p className={`${t.textSecondary} mt-2`}>Cart Items</p>
                </div>
                <div className={`${t.card} rounded-lg p-6 ${t.shadow} text-center`}>
                    <p className={`text-3xl font-bold text-purple-500`}>{profile.addresses.length}</p>
                    <p className={`${t.textSecondary} mt-2`}>Saved Addresses</p>
                </div>
            </div>
        </div>
    );
};

export default ProfileOverview;
