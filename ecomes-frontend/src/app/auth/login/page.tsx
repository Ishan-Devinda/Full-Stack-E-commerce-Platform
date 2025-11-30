"use client";

import dynamic from "next/dynamic";
import { Spin } from "antd";

const LoginForm = dynamic(() => import("@/components/auth/LoginForm"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-screen">
      <Spin size="large" />
    </div>
  ),
});

export default function LoginPage() {
  return <LoginForm />;
}
