import React from "react";
import { Button as AntButton, ButtonProps as AntButtonProps } from "antd";

interface ButtonProps extends AntButtonProps {
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return <AntButton {...props}>{children}</AntButton>;
};
