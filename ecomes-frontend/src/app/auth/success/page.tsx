"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { message, Spin } from "antd";

export default function AuthSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const processAuth = async () => {
      try {
        const accessToken = searchParams?.get("accessToken");
        const refreshToken = searchParams?.get("refreshToken");
        const userId = searchParams?.get("userId");
        const email = searchParams?.get("email");
        const username = searchParams?.get("username");

        console.log("Auth callback received:", {
          accessToken,
          refreshToken,
          userId,
          email,
          username,
        });

        if (accessToken && refreshToken && userId) {
          // Store tokens in localStorage
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
          localStorage.setItem(
            "user",
            JSON.stringify({
              id: userId,
              email: email,
              username: username,
              // You might want to get more user info from your API
            })
          );

          message.success("Google login successful!");

          // Navigate to dashboard
          router.push("/dashboard");
        } else {
          console.error("Missing tokens in URL");
          message.error("Authentication failed - missing tokens");
          router.push("/auth/login");
        }
      } catch (error) {
        console.error("Auth processing error:", error);
        message.error("Authentication failed");
        router.push("/auth/login");
      }
    };

    processAuth();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Spin size="large" />
        <h2 className="mt-4 text-xl font-semibold text-gray-700">
          Completing authentication...
        </h2>
        <p className="mt-2 text-gray-500">Please wait while we log you in.</p>
      </div>
    </div>
  );
}
