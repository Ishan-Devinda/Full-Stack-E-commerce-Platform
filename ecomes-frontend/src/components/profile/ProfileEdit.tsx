// src/components/profile/ProfileEdit.tsx
"use client";

import React, { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { Loader2, Save } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { themeConfig } from "@/lib/theme";
import { message } from "antd";

const ProfileEdit: React.FC = () => {
    const { profile, loading, updateProfile } = useProfile();
    const { theme } = useTheme();
    const t = themeConfig[theme];

    const [formData, setFormData] = useState({
        firstName: profile?.profile.firstName || "",
        lastName: profile?.profile.lastName || "",
        phone: profile?.profile.phone || "",
        dateOfBirth: profile?.profile.dateOfBirth || "",
        gender: profile?.profile.gender || "",
        bio: profile?.profile.bio || "",
    });

    const [saving, setSaving] = useState(false);

    React.useEffect(() => {
        if (profile) {
            setFormData({
                firstName: profile.profile.firstName || "",
                lastName: profile.profile.lastName || "",
                phone: profile.profile.phone || "",
                dateOfBirth: profile.profile.dateOfBirth || "",
                gender: profile.profile.gender || "",
                bio: profile.profile.bio || "",
            });
        }
    }, [profile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateProfile(formData);
            message.success("Profile updated successfully!");
        } catch (error) {
            message.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className={`${t.card} rounded-lg p-8 ${t.shadow}`}>
            <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">First Name</label>
                        <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            className={`w-full px-4 py-2 rounded-lg border ${t.border} ${t.bg} ${t.text}`}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Last Name</label>
                        <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            className={`w-full px-4 py-2 rounded-lg border ${t.border} ${t.bg} ${t.text}`}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Phone</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className={`w-full px-4 py-2 rounded-lg border ${t.border} ${t.bg} ${t.text}`}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Date of Birth</label>
                        <input
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                            className={`w-full px-4 py-2 rounded-lg border ${t.border} ${t.bg} ${t.text}`}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Gender</label>
                        <select
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            className={`w-full px-4 py-2 rounded-lg border ${t.border} ${t.bg} ${t.text}`}
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Bio</label>
                    <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        rows={4}
                        className={`w-full px-4 py-2 rounded-lg border ${t.border} ${t.bg} ${t.text}`}
                    />
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center"
                >
                    {saving ? (
                        <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="h-5 w-5 mr-2" />
                            Save Changes
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default ProfileEdit;
