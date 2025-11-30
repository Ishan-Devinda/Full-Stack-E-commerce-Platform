"use client";

import React from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Divider,
  message,
  Typography,
  Space,
} from "antd";
import {
  MailOutlined,
  LockOutlined,
  GoogleOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuth";
import { authAPI } from "../../services/api";
import Link from "next/link";

const { Title, Text } = Typography;

const LoginForm: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [form] = Form.useForm();

  const { login } = useAuth();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      await login(values);
      message.success("Login successful!");
      window.location.href = "/dashboard";
    } catch (error) {
      const err = error as Error;
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    authAPI.googleAuth();
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-6">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
      <Card
        style={{
          width: "100%",
          maxWidth: "480px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
          borderRadius: "16px",
          border: "none",
        }}
      >
        <div style={{ animation: "fadeIn 0.5s ease-out" }}>
          <div className="flex flex-col items-center mb-8">
            <div
              style={{
                width: "80px",
                height: "80px",
                background: "linear-gradient(90deg, #f97316, #f43f5e)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)",
              }}
            >
              <ShoppingOutlined style={{ fontSize: "36px", color: "white" }} />
            </div>
            <Title
              level={2}
              style={{
                background:
                  "linear-gradient(135deg, #f97316 0%, #ec4899 50%, #f43f5e 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: "2rem",
                fontWeight: "800",
              }}
            >
              Welcome to Our Store
            </Title>
            <Text type="secondary">Sign in to continue shopping</Text>
          </div>

          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            layout="vertical"
            autoComplete="off"
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Enter your email"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter your password"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Link
                href="/auth/forgot-password"
                className="p-0 float-right "
                style={{
                  color: "#f43f5e",
                  fontWeight: "500",
                  textDecoration: "none",
                }}
              >
                {" "}
                Forgot password?
              </Link>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                block
                style={{
                  height: "3.5rem", // h-14
                  borderRadius: "0.75rem", // rounded-xl
                  background:
                    "linear-gradient(to right, #f97316, #f97316, #ec4899)", // from-orange-500 via-orange-600 to-pink-600
                  border: "0",
                  boxShadow:
                    "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)", // shadow-lg
                  fontWeight: 600, // font-semibold
                  fontSize: "1.125rem", // text-lg
                  transition: "all 0.3s",
                  cursor: "pointer",
                }}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <Divider>or</Divider>

          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <Button
              size="large"
              block
              onClick={handleGoogleLogin}
              className="rounded-lg border-gray-300 hover:border-[#f43f5e] hover:text-[#f43f5e] transition-all flex items-center justify-center"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google Icon"
                className="w-5 h-5 mr-2"
              />
              Continue with Google
            </Button>
          </Space>

          <div className="mt-6 text-center">
            <Text>
              Don t have an account?{" "}
              <Link
                href="/auth/signup"
                style={{
                  color: "#f43f5e",
                  fontWeight: "500",
                  textDecoration: "none",
                }}
              >
                Sign up
              </Link>
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoginForm;
