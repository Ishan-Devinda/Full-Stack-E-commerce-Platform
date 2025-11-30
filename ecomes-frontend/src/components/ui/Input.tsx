import React from "react";
import { Input as AntInput, InputProps as AntInputProps } from "antd";

interface InputProps extends AntInputProps {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, ...props }) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <AntInput {...props} />
    </div>
  );
};
