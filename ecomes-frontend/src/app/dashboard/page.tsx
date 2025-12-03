"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Layout, Card, Typography } from "antd";
import { useAuth } from "@/hooks/useAuth";

const { Content } = Layout;
const { Title, Text } = Typography;

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout className="min-h-screen">

      <Content className="p-6">
        <Card>
          <Title level={2}>Dashboard</Title>
          <Text>
            Welcome back, {user.username}! You are successfully logged in.
          </Text>
          <div className="mt-4">
            <Text strong>Email: </Text>
            <Text>{user.email}</Text>
          </div>
          <div className="mt-2">
            <Text strong>User ID: </Text>
            <Text>{user.id}</Text>
          </div>
        </Card>
      </Content>
    </Layout>
  );
}
