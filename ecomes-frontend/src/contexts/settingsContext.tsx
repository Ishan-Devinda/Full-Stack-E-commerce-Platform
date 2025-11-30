"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Available currencies
export const AVAILABLE_CURRENCIES = ["USD", "LKR", "INR", "EUR", "GBP"];

type SettingsContextType = {
  currency: string;
  setCurrency: (currency: string) => void;
  convertPrice: (usdPrice: number) => number;
  formatPrice: (usdPrice: number) => string;
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currency, setCurrency] = useState("USD");
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
    USD: 1,
    LKR: 305, // example
    INR: 83,
    EUR: 0.93,
    GBP: 0.81,
  });

  // Optional: Fetch live rates from an API
  // (You can use https://api.exchangerate-api.com or your own backend)
  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await fetch(
          "https://api.exchangerate-api.com/v4/latest/USD"
        );
        const data = await res.json();
        setExchangeRates({
          USD: 1,
          LKR: data.rates.LKR || 305,
          INR: data.rates.INR || 83,
          EUR: data.rates.EUR || 0.93,
          GBP: data.rates.GBP || 0.81,
        });
      } catch (err) {
        console.warn("Could not fetch exchange rates, using defaults");
      }
    }
    fetchRates();
  }, []);

  const convertPrice = (usdPrice: number): number => {
    return usdPrice * (exchangeRates[currency] || 1);
  };

  const formatPrice = (usdPrice: number): string => {
    const converted = convertPrice(usdPrice);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(converted);
  };

  return (
    <SettingsContext.Provider
      value={{ currency, setCurrency, convertPrice, formatPrice }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context)
    throw new Error("useSettings must be used within SettingsProvider");
  return context;
};
