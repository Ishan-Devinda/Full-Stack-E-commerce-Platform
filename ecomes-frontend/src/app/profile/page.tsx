"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Layout, Card, Typography, Button, Space, Descriptions } from "antd";
import { UserOutlined, MailOutlined, EditOutlined } from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import EmailChangeFlow from "@/components/auth/EmailChangeFlow";

const { Content } = Layout;
const { Title } = Typography;

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [emailChangeVisible, setEmailChangeVisible] = useState(false);

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
      <Header />
      <Content className="p-6">
        <Card>
          <div className="flex justify-between items-center mb-6">
            <Title level={2}>Profile</Title>
            <Space>
              <Button
                icon={<EditOutlined />}
                onClick={() => setEmailChangeVisible(true)}
              >
                Change Email
              </Button>
            </Space>
          </div>

          <Descriptions bordered column={1}>
            <Descriptions.Item
              label="Username"
              labelStyle={{ fontWeight: "bold", width: "150px" }}
            >
              <UserOutlined className="mr-2" />
              {user.username}
            </Descriptions.Item>
            <Descriptions.Item
              label="Email"
              labelStyle={{ fontWeight: "bold" }}
            >
              <MailOutlined className="mr-2" />
              {user.email}
            </Descriptions.Item>
            <Descriptions.Item
              label="User ID"
              labelStyle={{ fontWeight: "bold" }}
            >
              {user.id}
            </Descriptions.Item>
            <Descriptions.Item
              label="Status"
              labelStyle={{ fontWeight: "bold" }}
            >
              <span className="text-green-500">Verified</span>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <EmailChangeFlow
          visible={emailChangeVisible}
          onClose={() => setEmailChangeVisible(false)}
        />
      </Content>
    </Layout>
  );
}
