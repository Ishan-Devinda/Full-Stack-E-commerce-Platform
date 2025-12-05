"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Available currencies
export const AVAILABLE_CURRENCIES = ["USD", "LKR", "INR", "EUR", "GBP"];

// Country flag mapping
export const COUNTRY_FLAGS: Record<string, string> = {
  US: "🇺🇸",
  IN: "🇮🇳",
  LK: "🇱🇰",
  GB: "🇬🇧",
  EU: "🇪🇺",
  DE: "🇩🇪",
  FR: "🇫🇷",
  JP: "🇯🇵",
  CN: "🇨🇳",
  AU: "🇦🇺",
  CA: "🇨🇦",
};

type SettingsContextType = {
  currency: string;
  setCurrency: (currency: string) => void;
  country: string;
  countryName: string;
  setCountry: (country: string) => void;
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
  const [country, setCountry] = useState("US");
  const [countryName, setCountryName] = useState("United States");
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
    USD: 1,
    LKR: 305,
    INR: 83,
    EUR: 0.93,
    GBP: 0.81,
  });

  // Fetch exchange rates
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

  // Fetch user location from IP
  useEffect(() => {
    async function fetchLocation() {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();

        if (data.country_code && data.country_name) {
          setCountry(data.country_code);
          setCountryName(data.country_name);

          // Auto-set currency based on country
          const currencyMap: Record<string, string> = {
            US: "USD",
            IN: "INR",
            LK: "LKR",
            GB: "GBP",
            EU: "EUR",
            DE: "EUR",
            FR: "EUR",
          };

          const detectedCurrency = currencyMap[data.country_code];
          if (detectedCurrency && AVAILABLE_CURRENCIES.includes(detectedCurrency)) {
            setCurrency(detectedCurrency);
          }
        }
      } catch (err) {
        console.warn("Could not fetch location, using defaults");
      }
    }
    fetchLocation();
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
      value={{
        currency,
        setCurrency,
        country,
        countryName,
        setCountry,
        convertPrice,
        formatPrice
      }}
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
