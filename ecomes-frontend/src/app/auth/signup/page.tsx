"use client";

import dynamic from "next/dynamic";
import { Spin } from "antd";

const SignupFlow = dynamic(() => import("@/components/auth/SignupFlow"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-screen">
      <Spin size="large" />
    </div>
  ),
});

export default function SignupPage() {
  return <SignupFlow />;
}
