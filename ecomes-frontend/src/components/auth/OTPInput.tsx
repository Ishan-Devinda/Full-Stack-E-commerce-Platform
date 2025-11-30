"use client";

import React, { useRef, useEffect, useState } from "react";
import { Input } from "antd";

interface OTPInputProps {
  length?: number;
  onChange: (otp: string) => void;
  value?: string;
}

const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  onChange,
  value = "",
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (value) {
      const newOtp = value.split("").slice(0, length);
      const filledOtp = [
        ...newOtp,
        ...new Array(length - newOtp.length).fill(""),
      ];
      setOtp(filledOtp);
    }
  }, [value, length]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Combine OTP values
    const combinedOtp = newOtp.join("");
    onChange(combinedOtp);

    // Focus next input
    if (element.value && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length);
    const pastedArray = pastedData.split("");

    const newOtp = [...otp];
    pastedArray.forEach((char, index) => {
      if (index < length) {
        newOtp[index] = char;
      }
    });

    setOtp(newOtp);
    onChange(newOtp.join(""));

    // Focus the last filled input or the last input
    const lastFilledIndex = Math.min(pastedArray.length, length - 1);
    inputsRef.current[lastFilledIndex]?.focus();
  };

  return (
    <div className="flex space-x-2 justify-center">
      {otp.map((digit, index) => (
        <Input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          value={digit}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          maxLength={1}
          className="w-12 h-12 text-center text-xl font-semibold"
          pattern="[0-9]*"
          inputMode="numeric"
        />
      ))}
    </div>
  );
};

export default OTPInput;
