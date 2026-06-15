import { useMutation, useQuery } from "@apollo/client/react";
import { GET_AUTHENTICATED_USER } from "../graphql/queries/user.queries";
import { UPDATE_TRANSACTION } from "../graphql/mutations/transaction.mutation";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getCompanyOptions } from "../lib/companyLogos";
import { useCurrency } from "../context/CurrencyContext";

const EditTransactionForm = ({ transaction, onSuccess, onCancel }) => {
  const { data: userData } = useQuery(GET_AUTHENTICATED_USER);
  const { rates } = useCurrency();
  const [updateTransaction, { loading }] = useMutation(UPDATE_TRANSACTION, {
    refetchQueries: ["GetTransactionHistory", "GetMonthlyHistory"],
  });

  // Helper to get currency symbol
  const getCurrencySymbolFor = (curr) => {
    const currencySymbols = {
      USD: "$", EUR: "€", GBP: "£", JPY: "¥",
      AUD: "A$", CAD: "C$", CHF: "Fr", CNY: "¥",
      INR: "₹", BDT: "৳",
    };
    return currencySymbols[curr] || curr;
  };

  // Form state
  const [selectedCompany, setSelectedCompany] = useState("google");
  const [customCompanyName, setCustomCompanyName] = useState("");
  const [serviceNameInput, setServiceNameInput] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("entertainment");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [billingDate, setBillingDate] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [initialized, setInitialized] = useState(false);

  const companyOptions = getCompanyOptions();

  // Initialize form with transaction data
  useEffect(() => {
    if (transaction && !initialized) {
      // Find matching company or set to "other"
      const matchingCompany = companyOptions.find(
        (opt) => opt.value.toLowerCase() === transaction.provider?.toLowerCase()
      );

      if (matchingCompany) {
        setSelectedCompany(matchingCompany.value);
        setCustomCompanyName("");
      } else {
        setSelectedCompany("other");
        setCustomCompanyName(transaction.provider || "");
      }

      setServiceNameInput(transaction.serviceName || "");
      if (transaction.originalAmount != null && transaction.originalCurrency) {
        // Source of truth: the exact amount + currency the user entered.
        setAmount(String(transaction.originalAmount));
        setCurrency(transaction.originalCurrency);
      } else {
        // Legacy records: reconstruct from the stored USD value.
        const savedCurrency = transaction.originalCurrency || "USD";
        const usdCost = transaction.costInDollar || 0;
        const rateForCurrency = rates[savedCurrency] || 1;
        setAmount(parseFloat((usdCost * rateForCurrency).toFixed(2)).toString());
        setCurrency(savedCurrency);
      }
      setCategory(transaction.category || "entertainment");
      setBillingCycle(transaction.billingCycle || "monthly");
      setPaymentMethodId(transaction.paymentMethodId || "");

      // Format date for input field
      if (transaction.billingDate) {
        const date = new Date(parseInt(transaction.billingDate));
        if (!isNaN(date.getTime())) {
          setBillingDate(date.toISOString().split("T")[0]);
        }
      }

      setInitialized(true);
    }
  }, [transaction, initialized, companyOptions, rates]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const provider = selectedCompany === "other" ? customCompanyName : selectedCompany;
    const serviceName = serviceNameInput || provider;

    // Send the entered amount + currency; the backend converts to USD authoritatively.
    const transactionData = {
      transactionId: transaction._id,
      serviceName: serviceName,
      provider: provider,
      category: category,
      amount: parseFloat(amount),
      currency: currency,
      billingCycle: billingCycle,
      billingDate: billingDate,
      paymentMethodId: paymentMethodId || null,
    };

    try {
      await updateTransaction({ variables: { input: transactionData } });
      toast.success("Transaction updated successfully");
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.message);
    }
  };

  if (!transaction) return null;

  return (
    <div className="relative">
      <form className="space-y-5" onSubmit={handleSubmit}>

        {/* Company/Provider Selector */}
        <div>
          <label className="block text-sm font-medium text-muted mb-1.5" htmlFor="company">
            Select Provider
          </label>
          <select
            className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
            id="company"
            name="company"
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            required
          >
            {companyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
            <option value="other">Other</option>
          </select>
        </div>

        {/* Custom Provider Name (shown when "Other" is selected) */}
        {selectedCompany === "other" && (
          <div>
            <label className="block text-sm font-medium text-muted mb-1.5" htmlFor="customName">
              Provider Name
            </label>
            <input
              className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
              id="customName"
              name="customName"
              type="text"
              value={customCompanyName}
              onChange={(e) => setCustomCompanyName(e.target.value)}
              placeholder="e.g., Custom Subscription Service"
              required
            />
          </div>
        )}

        {/* Service Name */}
        <div>
          <label className="block text-sm font-medium text-muted mb-1.5" htmlFor="serviceName">
            Service Name (Optional)
          </label>
          <input
            className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
            id="serviceName"
            name="serviceName"
            type="text"
            placeholder="e.g., Netflix Premium, Spotify Family"
            value={serviceNameInput}
            onChange={(e) => setServiceNameInput(e.target.value)}
          />
        </div>

        {/* Currency | Cost */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-1.5" htmlFor="currency">
              Currency
            </label>
            <select
              className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
              id="currency"
              name="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {Object.keys(rates).map((curr) => (
                <option key={curr} value={curr}>{curr}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1.5" htmlFor="amount">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-medium text-sm">
                {getCurrencySymbolFor(currency)}
              </span>
              <input
                className={`w-full pr-3 py-2.5 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 ${getCurrencySymbolFor(currency).length > 1 ? "pl-10" : "pl-7"}`}
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="9.99"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Category | Billing Cycle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-1.5" htmlFor="category">
              Category
            </label>
            <select
              className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
              id="category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="entertainment">Entertainment</option>
              <option value="productivity">Productivity</option>
              <option value="utilities">Utilities</option>
              <option value="education">Education</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1.5" htmlFor="billingCycle">
              Billing Cycle
            </label>
            <select
              className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
              id="billingCycle"
              name="billingCycle"
              value={billingCycle}
              onChange={(e) => setBillingCycle(e.target.value)}
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-muted mb-1.5" htmlFor="paymentMethodId">
            Payment Method
          </label>
          <select
            className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
            id="paymentMethodId"
            name="paymentMethodId"
            value={paymentMethodId}
            onChange={(e) => setPaymentMethodId(e.target.value)}
          >
            <option value="">Select Payment Method</option>
            {userData?.authUser?.paymentMethods?.map((method) => (
              <option key={method.id} value={method.id}>
                {method.name} {method.last4 && `(•••• ${method.last4})`}{method.isDefault ? " ★" : ""}
              </option>
            ))}
          </select>
          {(!userData?.authUser?.paymentMethods || userData.authUser.paymentMethods.length === 0) ? (
            <p className="text-xs text-muted mt-1">
              Add payment methods in{" "}
              <Link to="/settings" state={{ tab: "payments" }} className="text-accent hover:underline">
                Settings
              </Link>
            </p>
          ) : (
            <Link
              to="/settings"
              state={{ tab: "payments" }}
              className="text-xs text-accent hover:underline mt-1 inline-block"
            >
              + Manage payment methods
            </Link>
          )}
        </div>

        {/* Billing Date */}
        <div>
          <label className="block text-sm font-medium text-muted mb-1.5" htmlFor="billingDate">
            Billing Date
          </label>
          <input
            type="date"
            name="billingDate"
            id="billingDate"
            max={new Date().toISOString().split("T")[0]}
            className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
            value={billingDate}
            onChange={(e) => setBillingDate(e.target.value)}
            required
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-muted bg-surface-2 hover:bg-border rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            className="flex-1 bg-accent hover:bg-accent-hover text-accent-fg py-2.5 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Transaction"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTransactionForm;
