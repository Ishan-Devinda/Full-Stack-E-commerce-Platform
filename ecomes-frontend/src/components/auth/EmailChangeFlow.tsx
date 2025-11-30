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
  Modal,
} from "antd";
import {
  MailOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuth";
import OTPInput from "./OTPInput";

const { Step } = Steps;
const { Title, Text } = Typography;

const EmailChangeFlow: React.FC<{ visible: boolean; onClose: () => void }> = ({
  visible,
  onClose,
}) => {
  const [current, setCurrent] = useState(0);
  const [confirmToken, setConfirmToken] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const storedUser = localStorage.getItem("user");
  const userId = storedUser ? JSON.parse(storedUser)?.id : null;

  const { requestEmailChange, verifyEmailChangeOTP, confirmEmailChange } =
    useAuth();

  const steps = [
    {
      title: "Request Change",
      content: "request-change",
    },
    {
      title: "Verify Current Email",
      content: "verify-current",
    },
    {
      title: "Confirm New Email",
      content: "confirm-new",
    },
  ];

  const onRequestChange = async (values: {
    newEmail: string;
    password: string;
  }) => {
    setLoading(true);
    try {
      await requestEmailChange(values);
      setCurrent(1);
      message.success("Verification OTP sent to your current email!");
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const onVerifyCurrentEmail = async (values: { otp: string }) => {
    setLoading(true);
    try {
      const token = await verifyEmailChangeOTP({
        userId: userId || "", // or handle null based on your API needs
        otp: values.otp,
      });
      setConfirmToken(token);
      setCurrent(2);
      message.success("Confirmation OTP sent to your new email!");
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const onConfirmNewEmail = async (values: { otp: string }) => {
    setLoading(true);
    try {
      await confirmEmailChange({
        confirmToken,
        otp: values.otp,
      });
      message.success("Email changed successfully!");
      onClose();
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCurrent(0);
    setConfirmToken("");
    form.resetFields();
    onClose();
  };

  const renderRequestChange = () => (
    <Form form={form} onFinish={onRequestChange} layout="vertical">
      <Form.Item
        name="newEmail"
        label="New Email"
        rules={[
          { required: true, message: "Please input new email!" },
          { type: "email", message: "Please enter a valid email!" },
        ]}
      >
        <Input
          prefix={<MailOutlined />}
          placeholder="Enter new email address"
          size="large"
        />
      </Form.Item>

      <Form.Item
        name="password"
        label="Current Password"
        rules={[{ required: true, message: "Please input your password!" }]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Enter your current password"
          size="large"
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          size="large"
          block
        >
          Send Verification OTP
        </Button>
      </Form.Item>
    </Form>
  );

  const renderVerifyCurrentEmail = () => (
    <Form onFinish={onVerifyCurrentEmail} layout="vertical">
      <div className="text-center mb-6">
        <SafetyCertificateOutlined className="text-4xl text-blue-500 mb-4" />
        <Title level={4}>Verify Current Email</Title>
        <Text type="secondary">
          Enter the OTP sent to your current email address to verify this
          change.
        </Text>
      </div>

      <Form.Item
        name="otp"
        label="Enter OTP"
        rules={[
          { required: true, message: "Please enter the OTP!" },
          { len: 6, message: "OTP must be 6 digits!" },
        ]}
      >
        <OTPInput onChange={(otp) => form.setFieldsValue({ otp })} />
      </Form.Item>

      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          size="large"
          block
        >
          Verify & Continue
        </Button>
        <Button
          type="link"
          size="large"
          block
          onClick={() => {
            // Implement resend OTP logic here
            message.info("Resend OTP functionality to be implemented");
          }}
        >
          Resend OTP
        </Button>
      </Space>
    </Form>
  );

  const renderConfirmNewEmail = () => (
    <Form onFinish={onConfirmNewEmail} layout="vertical">
      <div className="text-center mb-6">
        <MailOutlined className="text-4xl text-blue-500 mb-4" />
        <Title level={4}>Confirm New Email</Title>
        <Text type="secondary">
          Enter the OTP sent to your new email address to complete the change.
        </Text>
      </div>

      <Form.Item
        name="otp"
        label="Enter OTP"
        rules={[
          { required: true, message: "Please enter the OTP!" },
          { len: 6, message: "OTP must be 6 digits!" },
        ]}
      >
        <OTPInput onChange={(otp) => form.setFieldsValue({ otp })} />
      </Form.Item>

      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          size="large"
          block
        >
          Confirm Email Change
        </Button>
        <Button
          type="link"
          size="large"
          block
          onClick={() => {
            // Implement resend OTP logic here
            message.info("Resend OTP functionality to be implemented");
          }}
        >
          Resend OTP
        </Button>
      </Space>
    </Form>
  );

  return (
    <Modal
      title="Change Email Address"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      centered
    >
      <div className="mt-6">
        <Steps current={current} size="small" className="mb-8">
          {steps.map((item) => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>

        <div className="mt-6">
          {current === 0 && renderRequestChange()}
          {current === 1 && renderVerifyCurrentEmail()}
          {current === 2 && renderConfirmNewEmail()}
        </div>
      </div>
    </Modal>
  );
};

export default EmailChangeFlow;
