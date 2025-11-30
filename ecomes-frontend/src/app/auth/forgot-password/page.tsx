"use client";

import dynamic from "next/dynamic";
import { Spin } from "antd";

const ForgotPasswordFlow = dynamic(
  () => import("@/components/auth/ForgotPasswordFlow"),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    ),
  }
);

export default function ForgotPasswordPage() {
  return <ForgotPasswordFlow />;
}
