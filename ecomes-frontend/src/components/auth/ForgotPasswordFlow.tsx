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
} from "antd";
import {
  MailOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuth";
import OTPInput from "./OTPInput";
import Link from "next/link";
import { useRouter } from "next/navigation";

const { Step } = Steps;
const { Title, Text } = Typography;

const ForgotPasswordFlow: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [otp, setOtp] = useState("");
  const router = useRouter();

  const { forgotPassword, resetPassword } = useAuth();

  const steps = [
    { title: "Enter Email", icon: <MailOutlined /> },
    { title: "Verify OTP", icon: <SafetyCertificateOutlined /> },
    { title: "Reset Password", icon: <LockOutlined /> },
  ];

  const onEmailSubmit = async (values: { email: string }) => {
    setLoading(true);
    try {
      const userId = await forgotPassword(values.email);
      setUserId(userId);
      setCurrent(1);
      message.success("OTP sent to your email!");
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOTP = async (values: { otp: string }) => {
    setLoading(true);
    try {
      setCurrent(2);
      setOtp(values?.otp);
      message.success("OTP verified!");
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async (values: {
    password: string;
    confirmPassword: string;
    otp: string;
  }) => {
    setLoading(true);
    try {
      await resetPassword({
        userId,
        otp: otp,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
      message.success("Password reset successfully!");
      //window.location.href = "/auth/login";
      router.push("/auth/login");
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderEnterEmail = () => (
    <Form form={form} onFinish={onEmailSubmit} layout="vertical">
      <div className="text-center mb-8">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-orange-500 to-pink-600 p-6 rounded-3xl shadow-xl">
            <MailOutlined className="text-6xl text-white" />
          </div>
        </div>
        <Title
          level={3}
          className="mb-2 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent"
        >
          Forgot Your Password?
        </Title>
        <Text className="text-gray-600 text-base">
          No worries! Enter your email and we'll send you a secure OTP to reset
          your password.
        </Text>
      </div>

      <Form.Item
        name="email"
        label={
          <Text className="text-gray-700 font-semibold">Email Address</Text>
        }
        rules={[
          { required: true, message: "Please input your email!" },
          { type: "email", message: "Please enter a valid email!" },
        ]}
      >
        <Input
          prefix={<MailOutlined className="text-orange-500 text-lg" />}
          placeholder="your.email@example.com"
          size="large"
          className="rounded-xl border-2 border-gray-200 hover:border-orange-400 focus:border-orange-500 transition-all duration-300 py-3"
        />
      </Form.Item>

      <Form.Item className="mb-0">
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          size="large"
          block
          style={{
            height: "3.5rem", // h-14
            borderRadius: "0.75rem", // rounded-xl
            background: "linear-gradient(to right, #f97316, #f97316, #ec4899)", // from-orange-500 via-orange-600 to-pink-600
            border: "0",
            boxShadow:
              "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)", // shadow-lg
            fontWeight: 600, // font-semibold
            fontSize: "1.125rem", // text-lg
            transition: "all 0.3s",
            cursor: "pointer",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.02)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {loading ? "Sending..." : "Send Verification Code"}
        </Button>
      </Form.Item>
    </Form>
  );

  const renderVerifyOTP = () => (
    <Form onFinish={onVerifyOTP} layout="vertical">
      <div className="text-center mb-8">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-pink-500 to-rose-600 p-6 rounded-3xl shadow-xl">
            <SafetyCertificateOutlined className="text-6xl text-white" />
          </div>
        </div>
        <Title
          level={3}
          className="mb-2 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent"
        >
          Verify Your Identity
        </Title>
        <Text className="text-gray-600 text-base">
          We've sent a 6-digit verification code to your email. Please enter it
          below.
        </Text>
      </div>

      <Form.Item
        name="otp"
        label={
          <Text className="text-gray-700 font-semibold">Verification Code</Text>
        }
        rules={[
          { required: true, message: "Please enter the OTP!" },
          { len: 6, message: "OTP must be 6 digits!" },
        ]}
      >
        <OTPInput onChange={(otp) => form.setFieldsValue({ otp })} />
      </Form.Item>

      <Space
        direction="vertical"
        style={{ width: "100%" }}
        size="large"
        className="mt-6"
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
            background: "linear-gradient(to right, #f97316, #f97316, #ec4899)", // from-orange-500 via-orange-600 to-pink-600
            border: "0",
            boxShadow:
              "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)", // shadow-lg
            fontWeight: 600, // font-semibold
            fontSize: "1.125rem", // text-lg
            transition: "all 0.3s",
            cursor: "pointer",
          }}
        >
          {loading ? "Verifying..." : "Verify & Continue"}
        </Button>
        <div className="text-center">
          <Text className="text-gray-600">Didn't receive the code? </Text>
          <Button
            type="link"
            onClick={() =>
              message.info("Resend OTP functionality to be implemented")
            }
            className="p-0 font-semibold text-pink-600 hover:text-orange-600 transition-colors duration-300"
          >
            Resend Code
          </Button>
        </div>
      </Space>
    </Form>
  );

  const renderResetPassword = () => (
    <Form onFinish={onResetPassword} layout="vertical">
      <div className="text-center mb-8">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-orange-500 to-pink-600 p-6 rounded-3xl shadow-xl">
            <LockOutlined className="text-6xl text-white" />
          </div>
        </div>
        <Title
          level={3}
          className="mb-2 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent"
        >
          Create New Password
        </Title>
        <Text className="text-gray-600 text-base">
          Choose a strong password to secure your account.
        </Text>
      </div>

      <Form.Item
        name="otp"
        label={
          <Text className="text-gray-700 font-semibold">Verification Code</Text>
        }
        rules={[
          { required: true, message: "Please enter the OTP!" },
          { len: 6, message: "OTP must be 6 digits!" },
        ]}
      >
        <OTPInput
          onChange={(otp) => form.setFieldsValue({ otp })}
          value={otp}
        />
      </Form.Item>

      <Form.Item
        name="password"
        label={
          <Text className="text-gray-700 font-semibold">New Password</Text>
        }
        rules={[
          { required: true, message: "Please input your password!" },
          { min: 8, message: "Password must be at least 8 characters!" },
          {
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
            message:
              "Must include uppercase, lowercase, number, and special character!",
          },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined className="text-orange-500 text-lg" />}
          placeholder="Enter your new password"
          size="large"
          className="rounded-xl border-2 border-gray-200 hover:border-orange-400 focus:border-orange-500 transition-all duration-300 py-3"
        />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        label={
          <Text className="text-gray-700 font-semibold">
            Confirm New Password
          </Text>
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
          prefix={<CheckCircleOutlined className="text-pink-500 text-lg" />}
          placeholder="Confirm your new password"
          size="large"
          className="rounded-xl border-2 border-gray-200 hover:border-pink-400 focus:border-pink-500 transition-all duration-300 py-3"
        />
      </Form.Item>

      <Form.Item className="mb-0 mt-6">
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          size="large"
          block
          style={{
            height: "3.5rem", // h-14
            borderRadius: "0.75rem", // rounded-xl
            background: "linear-gradient(to right, #f97316, #f97316, #ec4899)", // from-orange-500 via-orange-600 to-pink-600
            border: "0",
            boxShadow:
              "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)", // shadow-lg
            fontWeight: 600, // font-semibold
            fontSize: "1.125rem", // text-lg
            transition: "all 0.3s",
            cursor: "pointer",
          }}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-6">
      {/* Animated Background */}

      <Card
        className="w-full max-w-lg relative z-10 rounded-3xl shadow-2xl border-0 overflow-hidden"
        bodyStyle={{ padding: 0 }}
      >
        {/* Glass Effect Card */}
        <div className="backdrop-blur-xl bg-white/90 p-10">
          <div className="text-center mb-8">
            <Title
              level={2}
              className="mb-2"
              style={{
                background:
                  "linear-gradient(135deg, #f97316 0%, #ec4899 50%, #f43f5e 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: "2rem",
                fontWeight: "800",
              }}
            >
              Password Recovery
            </Title>
            <Text className="text-gray-600 text-base">
              Secure and easy password reset process
            </Text>
          </div>

          <Steps
            current={current}
            className="mb-10"
            items={steps.map((item, index) => ({
              title: <span className="text-sm font-medium">{item.title}</span>,
              icon: (
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                    current === index
                      ? "bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-lg scale-110"
                      : current > index
                      ? "bg-gradient-to-r from-green-400 to-green-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {current > index ? <CheckCircleOutlined /> : item.icon}
                </div>
              ),
            }))}
          />

          <div className="mt-6">
            {current === 0 && renderEnterEmail()}
            {current === 1 && renderVerifyOTP()}
            {current === 2 && renderResetPassword()}
          </div>

          <div className="mt-8 text-center pt-6 border-t border-gray-200">
            <Text className="text-gray-600">
              Remember your password?{" "}
              <Link
                href="/auth/login"
                className="p-0 font-semibold text-pink-600 hover:text-orange-600 transition-colors duration-300"
              >
                Back to Login
              </Link>
            </Text>
          </div>
        </div>
      </Card>

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default ForgotPasswordFlow;
