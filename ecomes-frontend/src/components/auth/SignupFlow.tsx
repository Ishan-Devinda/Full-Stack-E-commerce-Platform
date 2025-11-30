"use client";

import React, { useState } from "react";
import {
  Steps,
  Button,
  Form,
  Input,
  Card,
  message,
  Typography,
  Space,
  Progress,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  CheckCircleFilled,
  ShoppingOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuth";
import OTPInput from "./OTPInput";
import { useRouter } from "next/navigation";
import Link from "next/link";

const { Step } = Steps;
const { Title, Text } = Typography;

const SignupFlow: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [strength, setStrength] = useState(0);
  const router = useRouter();

  const { signup, verifyOTP, setPassword } = useAuth();

  const steps = [
    { title: "Basic Info", icon: <UserOutlined /> },
    { title: "Verify Email", icon: <SafetyCertificateOutlined /> },
    { title: "Set Password", icon: <LockOutlined /> },
  ];

  const calculateStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[a-z]/.test(password)) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/\d/.test(password)) score += 12.5;
    if (/[@$!%*?&]/.test(password)) score += 12.5;
    return score;
  };

  const onBasicInfoSubmit = async (values: {
    username: string;
    email: string;
  }) => {
    setLoading(true);
    try {
      const userId = await signup(values);
      setUserId(userId);
      setCurrent(1);
      message.success("OTP sent to your email!");
    } catch (error) {
      const err = error as Error;
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOTP = async (values: { otp: string }) => {
    setLoading(true);
    try {
      await verifyOTP({ userId, otp: values.otp });
      setCurrent(2);
      message.success("Email verified successfully!");
    } catch (error) {
      const err = error as Error;
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onSetPassword = async (values: {
    password: string;
    confirmPassword: string;
  }) => {
    setLoading(true);
    try {
      await setPassword({ userId, ...values });
      message.success("Account created successfully!");
      router.push("/auth/login");
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderBasicInfo = () => (
    <div style={{ animation: "fadeIn 0.5s ease-out" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div
          style={{
            width: "80px",
            height: "80px",
            background: "linear-gradient(135deg, #f97316 0%, #ec4899 100%)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 10px 25px rgba(249, 115, 22, 0.3)",
          }}
        >
          <ShoppingOutlined style={{ fontSize: "36px", color: "white" }} />
        </div>
        <Title
          level={3}
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
        <Text type="secondary" style={{ fontSize: "16px" }}>
          Start your shopping journey with us
        </Text>
      </div>

      <Form form={form} onFinish={onBasicInfoSubmit} layout="vertical">
        <Form.Item
          name="username"
          label={
            <span style={{ color: "#374151", fontWeight: "500" }}>
              Username
            </span>
          }
          rules={[
            { required: true, message: "Please input your username!" },
            { min: 3, message: "Username must be at least 3 characters!" },
            { max: 30, message: "Username must be less than 30 characters!" },
            {
              pattern: /^[a-zA-Z0-9_]+$/,
              message:
                "Username can only contain letters, numbers, and underscores!",
            },
          ]}
        >
          <Input
            prefix={<UserOutlined style={{ color: "#9ca3af" }} />}
            placeholder="Choose a unique username"
            size="large"
            style={{ borderRadius: "8px" }}
          />
        </Form.Item>

        <Form.Item
          name="email"
          label={
            <span style={{ color: "#374151", fontWeight: "500" }}>
              Email Address
            </span>
          }
          rules={[
            { required: true, message: "Please input your email!" },
            { type: "email", message: "Please enter a valid email!" },
          ]}
        >
          <Input
            prefix={<MailOutlined style={{ color: "#9ca3af" }} />}
            placeholder="your.email@example.com"
            size="large"
            style={{ borderRadius: "8px" }}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            block
            style={{
              height: "48px",
              fontSize: "18px",
              fontWeight: "600",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #f97316 0%, #ec4899 100%)",
              border: "none",
              boxShadow: "0 4px 15px rgba(249, 115, 22, 0.4)",
            }}
          >
            Continue
          </Button>
        </Form.Item>
      </Form>
    </div>
  );

  const renderVerifyEmail = () => (
    <div style={{ animation: "fadeIn 0.5s ease-out" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div
          style={{
            width: "80px",
            height: "80px",
            background: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 10px 25px rgba(236, 72, 153, 0.3)",
            animation: "pulse 2s infinite",
          }}
        >
          <SafetyCertificateOutlined
            style={{ fontSize: "36px", color: "white" }}
          />
        </div>
        <Title
          level={3}
          style={{
            background:
              "linear-gradient(135deg, #f97316 0%, #ec4899 50%, #f43f5e 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: "2rem",
            fontWeight: "800",
          }}
        >
          Verify Your Email
        </Title>
        <Text
          type="secondary"
          style={{ fontSize: "16px", display: "block", marginBottom: "8px" }}
        >
          We have sent a 6-digit code to your email
        </Text>
        <Text style={{ color: "#ec4899", fontWeight: "500" }}>
          {form.getFieldValue("email")}
        </Text>
      </div>

      <Form onFinish={onVerifyOTP} layout="vertical">
        <Form.Item
          name="otp"
          rules={[
            { required: true, message: "Please enter the OTP!" },
            { len: 6, message: "OTP must be 6 digits!" },
          ]}
        >
          <OTPInput onChange={(otp) => form.setFieldsValue({ otp })} />
        </Form.Item>

        <Space
          direction="vertical"
          style={{ width: "100%", marginTop: "24px" }}
          size="middle"
        >
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
            Verify & Continue
          </Button>
          <Button
            type="link"
            size="large"
            block
            style={{ color: "#6b7280" }}
            onClick={() => {
              message.info("New code sent to your email");
            }}
          >
            Didn't receive code? Resend
          </Button>
        </Space>
      </Form>
    </div>
  );

  const renderSetPassword = () => (
    <div style={{ animation: "fadeIn 0.5s ease-out" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div
          style={{
            width: "80px",
            height: "80px",
            background: "linear-gradient(135deg, #f43f5e 0%, #f97316 100%)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 10px 25px rgba(244, 63, 94, 0.3)",
          }}
        >
          <LockOutlined style={{ fontSize: "36px", color: "white" }} />
        </div>
        <Title
          level={3}
          style={{
            background:
              "linear-gradient(135deg, #f97316 0%, #ec4899 50%, #f43f5e 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: "2rem",
            fontWeight: "800",
          }}
        >
          Secure Your Account
        </Title>
        <Text type="secondary" style={{ fontSize: "16px" }}>
          Create a strong password to protect your account
        </Text>
      </div>

      <Form onFinish={onSetPassword} layout="vertical">
        <Form.Item
          name="password"
          label={
            <span style={{ color: "#374151", fontWeight: "500" }}>
              Password
            </span>
          }
          rules={[
            { required: true, message: "Please input your password!" },
            { min: 8, message: "Password must be at least 8 characters!" },
            {
              pattern:
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
              message:
                "Password must contain uppercase, lowercase, number and special character!",
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: "#9ca3af" }} />}
            placeholder="Create a strong password"
            size="large"
            style={{ borderRadius: "8px" }}
            onChange={(e) => setStrength(calculateStrength(e.target.value))}
          />
        </Form.Item>

        {strength > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "4px",
              }}
            >
              <Text style={{ fontSize: "12px", color: "#6b7280" }}>
                Password Strength
              </Text>
              <Text
                style={{
                  fontSize: "12px",
                  fontWeight: "500",
                  color:
                    strength < 50
                      ? "#ef4444"
                      : strength < 75
                      ? "#f59e0b"
                      : "#10b981",
                }}
              >
                {strength < 50 ? "Weak" : strength < 75 ? "Medium" : "Strong"}
              </Text>
            </div>
            <Progress
              percent={strength}
              showInfo={false}
              strokeColor={{
                "0%": "#f97316",
                "50%": "#ec4899",
                "100%": "#f43f5e",
              }}
            />
          </div>
        )}

        <Form.Item
          name="confirmPassword"
          label={
            <span style={{ color: "#374151", fontWeight: "500" }}>
              Confirm Password
            </span>
          }
          dependencies={["password"]}
          rules={[
            { required: true, message: "Please confirm your password!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match!"));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: "#9ca3af" }} />}
            placeholder="Confirm your password"
            size="large"
            style={{ borderRadius: "8px" }}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            block
            style={{
              height: "48px",
              fontSize: "18px",
              fontWeight: "600",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #f97316 0%, #ec4899 100%)",
              border: "none",
              boxShadow: "0 4px 15px rgba(249, 115, 22, 0.4)",
            }}
          >
            Create Account
          </Button>
        </Form.Item>
      </Form>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-6">
      {/* Animated Background */}

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
        <div style={{ marginBottom: "24px" }}>
          <Progress
            percent={(current + 1) * 33.33}
            showInfo={false}
            strokeColor={{
              "0%": "#f97316",
              "50%": "#ec4899",
              "100%": "#f43f5e",
            }}
            style={{ marginBottom: "24px" }}
          />

          <Steps current={current} style={{ marginBottom: "32px" }}>
            {steps.map((item, index) => (
              <Step
                key={item.title}
                title={<span style={{ fontSize: "14px" }}>{item.title}</span>}
                icon={
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        index < current
                          ? "#f43f5e"
                          : index === current
                          ? "#ec4899"
                          : "#d1d5db",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {index < current ? (
                      <CheckCircleFilled style={{ color: "white" }} />
                    ) : (
                      <span style={{ color: "white" }}>{item.icon}</span>
                    )}
                  </div>
                }
              />
            ))}
          </Steps>
        </div>

        <div style={{ marginTop: "24px" }}>
          {current === 0 && renderBasicInfo()}
          {current === 1 && renderVerifyEmail()}
          {current === 2 && renderSetPassword()}
        </div>

        <div
          style={{
            marginTop: "32px",
            paddingTop: "24px",
            borderTop: "1px solid #e5e7eb",
            textAlign: "center",
          }}
        >
          <Text style={{ color: "#6b7280" }}>
            Already have an account?{" "}
            <Link
              href="/auth/login"
              style={{
                color: "#f43f5e",
                fontWeight: "500",
                textDecoration: "none",
              }}
            >
              Sign in
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default SignupFlow;
