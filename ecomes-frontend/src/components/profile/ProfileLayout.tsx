// src/components/profile/ProfileLayout.tsx
"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { User, MapPin, Package, CreditCard, Edit, LogOut } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { themeConfig } from "@/lib/theme";

interface ProfileLayoutProps {
    children: React.ReactNode;
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({ children }) => {
    const pathname = usePathname();
    const router = useRouter();
    const { theme } = useTheme();
    const t = themeConfig[theme];

    const menuItems = [
        { icon: User, label: "Profile Overview", path: "/profile" },
        { icon: Edit, label: "Edit Profile", path: "/profile/edit" },
        { icon: MapPin, label: "Addresses", path: "/profile/addresses" },
        { icon: Package, label: "Orders", path: "/profile/orders" },
        { icon: CreditCard, label: "Payments", path: "/profile/payments" },
    ];

    const handleLogout = () => {
        // Implement logout logic
        localStorage.removeItem("token");
        router.push("/");
    };

    return (
        <div className="min-h-screen relative py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <h1 className="text-3xl font-bold mb-8">My Account</h1>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className={`${t.card} rounded-lg p-4 ${t.shadow}`}>
                            <nav className="space-y-2">
                                {menuItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.path;

                                    return (
                                        <button
                                            key={item.path}
                                            onClick={() => router.push(item.path)}
                                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                                ? "bg-blue-500 text-white"
                                                : `${t.hover} ${t.text}`
                                                }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span className="font-medium">{item.label}</span>
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={handleLogout}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${t.hover} ${t.text} text-red-500`}
                                >
                                    <LogOut className="h-5 w-5" />
                                    <span className="font-medium">Logout</span>
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">{children}</div>
                </div>
            </div>
        </div>
    );
};

export default ProfileLayout;
