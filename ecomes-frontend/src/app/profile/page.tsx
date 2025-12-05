"use client";

import React from "react";
import ProfileLayout from "@/components/profile/ProfileLayout";
import { useProfile } from "@/hooks/useProfile";
import { useAddresses } from "@/hooks/useAddresses";
import { useOrders } from "@/hooks/useOrders";
import { usePaymentHistory } from "@/hooks/usePaymentHistory";
import { useTheme } from "@/contexts/ThemeContext";
import { themeConfig } from "@/lib/theme";
import {
  Loader2,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Package,
  CreditCard,
  User as UserIcon,
  Edit,
  Plus
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { profile, loading: profileLoading } = useProfile();
  const { addresses, loading: addressesLoading } = useAddresses();
  const { orders, loading: ordersLoading } = useOrders(1, 5);
  const { payments, loading: paymentsLoading } = usePaymentHistory(1, 5);
  const { theme } = useTheme();
  const t = themeConfig[theme];
  const router = useRouter();

  const loading = profileLoading || addressesLoading || ordersLoading || paymentsLoading;

  if (loading) {
    return (
      <ProfileLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </ProfileLayout>
    );
  }

  const defaultAddress = addresses.find((addr) => addr.isDefault);

  return (
    <ProfileLayout>
      <div className="space-y-6">
        {/* Profile Header */}
        <div className={`${t.card} rounded-lg p-8 ${t.shadow}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Profile Overview</h2>
            <Link href="/profile/edit">
              <button className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                <Edit className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200">
              {profile?.profile.avatar?.url ? (
                <Image
                  src={profile.profile.avatar.url}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400">
                  {profile?.profile.firstName?.[0] || profile?.username[0].toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1">
              <h3 className="text-2xl font-bold">
                {profile?.profile.firstName && profile?.profile.lastName
                  ? `${profile.profile.firstName} ${profile.profile.lastName}`
                  : profile?.username}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className={t.textSecondary}>{profile?.email}</span>
                </div>
                {profile?.profile.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className={t.textSecondary}>{profile.profile.phone}</span>
                  </div>
                )}
                {profile?.profile.dateOfBirth && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className={t.textSecondary}>
                      {new Date(profile.profile.dateOfBirth).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`${t.card} rounded-lg p-6 ${t.shadow} text-center`}>
            <Package className="h-8 w-8 mx-auto text-blue-500 mb-2" />
            <p className="text-3xl font-bold text-blue-500">{orders.length}</p>
            <p className={`${t.textSecondary} mt-2`}>Total Orders</p>
          </div>
          <div className={`${t.card} rounded-lg p-6 ${t.shadow} text-center`}>
            <MapPin className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <p className="text-3xl font-bold text-green-500">{addresses.length}</p>
            <p className={`${t.textSecondary} mt-2`}>Saved Addresses</p>
          </div>
          <div className={`${t.card} rounded-lg p-6 ${t.shadow} text-center`}>
            <CreditCard className="h-8 w-8 mx-auto text-purple-500 mb-2" />
            <p className="text-3xl font-bold text-purple-500">{payments.length}</p>
            <p className={`${t.textSecondary} mt-2`}>Payments</p>
          </div>
        </div>

        {/* Addresses Section */}
        <div className={`${t.card} rounded-lg p-6 ${t.shadow}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              My Addresses
            </h3>
            <Link href="/profile/addresses">
              <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
                View All →
              </button>
            </Link>
          </div>

          {addresses.length === 0 ? (
            <div className="text-center py-8">
              <p className={t.textSecondary}>No addresses saved yet</p>
              <Link href="/profile/addresses">
                <button className="mt-4 text-blue-500 hover:text-blue-600 flex items-center mx-auto">
                  <Plus className="h-4 w-4 mr-1" />
                  Add your first address
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.slice(0, 2).map((address) => (
                <div key={address._id} className={`border ${t.border} rounded-lg p-4 relative`}>
                  {address.isDefault && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      Default
                    </div>
                  )}
                  <p className="font-semibold">{address.fullName}</p>
                  <p className={`${t.textSecondary} text-sm mt-1`}>{address.addressLine1}</p>
                  <p className={`${t.textSecondary} text-sm`}>
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  <p className={`${t.textSecondary} text-sm`}>{address.phone}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders Section */}
        <div className={`${t.card} rounded-lg p-6 ${t.shadow}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Recent Orders
            </h3>
            <Link href="/profile/orders">
              <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
                View All →
              </button>
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className={t.textSecondary}>No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 3).map((order) => (
                <div
                  key={order._id}
                  className={`border ${t.border} rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow`}
                  onClick={() => router.push(`/profile/orders/${order._id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500">Order #{order._id.slice(-8)}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm mt-1">{order.items.length} items</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${order.totalAmount.toFixed(2)}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded mt-2 inline-block ${order.status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "processing"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Payments Section */}
        <div className={`${t.card} rounded-lg p-6 ${t.shadow}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Recent Payments
            </h3>
            <Link href="/profile/payments">
              <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
                View All →
              </button>
            </Link>
          </div>

          {payments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className={t.textSecondary}>No payments yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Payment ID
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {payments.slice(0, 3).map((payment) => (
                    <tr key={payment._id} className={t.hover}>
                      <td className="px-4 py-3 text-sm">{payment.paymentId.slice(-12)}</td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        ${payment.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
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
          )}
        </div>
      </div>
    </ProfileLayout>
  );
}
