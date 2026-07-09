/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_AUTHENTICATED_USER } from "../graphql/queries/user.queries";
import { GET_EXCHANGE_RATES } from "../graphql/queries/exchangeRate.queries";

const CurrencyContext = createContext();

// Static fallback rates — only used until/if the backend rate query resolves.
const FALLBACK_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  AUD: 1.52,
  CAD: 1.36,
  CHF: 0.88,
  CNY: 7.24,
  INR: 83.12,
  BDT: 109.50,
};

export const CurrencyProvider = ({ children }) => {
  const { data: userData } = useQuery(GET_AUTHENTICATED_USER);
  const { data: ratesData } = useQuery(GET_EXCHANGE_RATES);
  const [currency, setCurrency] = useState("USD");

  // Live rates from the backend (single source of truth), with static fallback.
  const rates = useMemo(() => {
    const list = ratesData?.exchangeRates?.rates;
    if (!list || list.length === 0) return FALLBACK_RATES;
    return list.reduce((acc, { code, rate }) => {
      acc[code] = rate;
      return acc;
    }, {});
  }, [ratesData]);

  // Update currency when user data changes
  useEffect(() => {
    if (userData?.authUser?.currency) {
      setCurrency(userData.authUser.currency);
    }
  }, [userData]);

  // Convert USD amount to user's selected currency
  const convertFromUSD = (usdAmount) => {
    if (!usdAmount) return 0;
    const rate = rates[currency] || 1;
    return usdAmount * rate;
  };

  // Convert user's currency to USD for storage
  const convertToUSD = (amount, fromCurrency = currency) => {
    if (!amount) return 0;
    const rate = rates[fromCurrency] || 1;
    return amount / rate;
  };

  // Format amount with currency symbol
  const formatCurrency = (usdAmount, showSymbol = true) => {
    const convertedAmount = convertFromUSD(usdAmount);
    
    const currencySymbols = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      AUD: "A$",
      CAD: "C$",
      CHF: "Fr",
      CNY: "¥",
      INR: "₹",
      BDT: "৳",
    };

    const symbol = currencySymbols[currency] || currency;

    // Money is displayed rounded to whole numbers across the app for a cleaner,
    // consistent look. Stored values remain exact — this only affects display.
    const formattedAmount = Math.round(convertedAmount).toLocaleString();

    return showSymbol ? `${symbol}${formattedAmount}` : formattedAmount;
  };

  // Get currency symbol
  const getCurrencySymbol = () => {
    const currencySymbols = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      AUD: "A$",
      CAD: "C$",
      CHF: "Fr",
      CNY: "¥",
      INR: "₹",
      BDT: "৳",
    };
    return currencySymbols[currency] || currency;
  };

  const value = {
    currency,
    setCurrency,
    rates,
    convertFromUSD,
    convertToUSD,
    formatCurrency,
    getCurrencySymbol,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return context;
};
