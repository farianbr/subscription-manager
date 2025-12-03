/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_AUTHENTICATED_USER } from "../graphql/queries/user.queries";

const CurrencyContext = createContext();

// Exchange rates (you can fetch these from an API in production)
const EXCHANGE_RATES = {
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
  const [currency, setCurrency] = useState("USD");
  const rates = EXCHANGE_RATES;

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
    const formattedAmount = convertedAmount.toFixed(2);

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
