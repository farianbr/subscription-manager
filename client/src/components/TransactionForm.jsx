import { CREATE_SUBSCRIPTION } from "../graphql/mutations/subscription.mutation";
import { useMutation, useQuery } from "@apollo/client/react";
import { GET_AUTHENTICATED_USER } from "../graphql/queries/user.queries";
import { ADD_PAYMENT_METHOD } from "../graphql/mutations/user.mutation";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getCompanyOptions } from "../lib/companyLogos";
import { useCurrency } from "../context/CurrencyContext";

const TransactionForm = ({ onSuccess }) => {
  const { data: userData } = useQuery(GET_AUTHENTICATED_USER);
  const { rates } = useCurrency();
  const [createSubscription, { loading }] = useMutation(CREATE_SUBSCRIPTION, {
    refetchQueries: ["GetSubscriptions", "GetMonthlyHistory"],
  });
  const [addPaymentMethod, { loading: addingPayment }] = useMutation(ADD_PAYMENT_METHOD);

  const [selectedCompany, setSelectedCompany] = useState("google");
  const [customCompanyName, setCustomCompanyName] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [paymentData, setPaymentData] = useState({
    name: "",
    type: "card",
    last4: "",
  });
  const companyOptions = getCompanyOptions();

  // Helper function to get currency symbol for a specific currency
  const getCurrencySymbolFor = (curr) => {
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
    return currencySymbols[curr] || curr;
  };

  // Auto-select default payment method or set to add new payment method
  useEffect(() => {
    const methods = userData?.authUser?.paymentMethods;
    if (!methods || methods.length === 0) {
      setShowPaymentForm(true);
    } else {
      const defaultMethod = methods.find(m => m.isDefault);
      if (defaultMethod) {
        setSelectedPaymentMethod(defaultMethod.id);
      } else {
        setSelectedPaymentMethod(methods[0].id);
      }
      setShowPaymentForm(false);
    }
  }, [userData]);

  const handleAddPaymentMethod = async (e) => {
    e.preventDefault();
    try {
      await addPaymentMethod({
        variables: { 
          input: { 
            ...paymentData, 
            isDefault: !userData?.authUser?.paymentMethods || userData.authUser.paymentMethods.length === 0 
          } 
        },
        refetchQueries: ["GetAuthenticatedUser"],
      });
      toast.success("Payment method added");
      setPaymentData({ name: "", type: "card", last4: "" });
      setShowPaymentForm(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    
    // Get provider and service name
    const companyKey = formData.get("company");
    const provider = companyKey === "other" ? formData.get("customName") : companyKey;
    const serviceName = formData.get("serviceName") || provider;
    
    // Get start date from form
    const startDate = formData.get("startDate");
    
    // Send the entered amount + currency; the backend converts to USD authoritatively.
    const amount = parseFloat(formData.get("amount") || "0");

    const subscriptionData = {
      serviceName: serviceName,
      provider: provider,
      category: formData.get("category"),
      amount: amount,
      currency: selectedCurrency,
      startDate: startDate,
      alertEnabled: formData.get("alertEnabled") === "on",
      billingCycle: formData.get("billingCycle") || "monthly",
      paymentMethodId: selectedPaymentMethod || null,
    };
    
    try {
      await createSubscription({ variables: { input: subscriptionData } });

      form.reset();
      setSelectedCompany("google");
      setCustomCompanyName("");
      toast.success("Subscription created successfully");
      
      // Call onSuccess callback if provided (for modal)
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

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
          />
        </div>

        {/* Cost with Currency Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-1.5" htmlFor="currency">
              Currency
            </label>
            <select
              className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
              id="currency"
              name="currency"
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
            >
              {Object.keys(rates).map((curr) => (
                <option key={curr} value={curr}>
                  {curr}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1.5" htmlFor="amount">
              Cost
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-medium">{getCurrencySymbolFor(selectedCurrency)}</span>
              <input
                className="w-full pl-7 pr-3 py-2.5 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="9.99"
                required
              />
            </div>
          </div>
        </div>

        {/* Category & Billing Cycle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-1.5" htmlFor="category">
              Category
            </label>
            <select
              className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
              id="category"
              name="category"
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
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>

        {/* Payment Method Section */}
        {showPaymentForm ? (
          <div className="space-y-4 p-4 bg-surface-2 rounded-xl border border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted">Add Payment Method</h3>
              {userData?.authUser?.paymentMethods && userData.authUser.paymentMethods.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="text-xs text-muted hover:text-foreground"
                >
                  Use existing
                </button>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Method Name</label>
              <input
                type="text"
                value={paymentData.name}
                onChange={(e) => setPaymentData({ ...paymentData, name: e.target.value })}
                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-sm"
                placeholder="e.g., Visa Card"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Type</label>
                <select
                  value={paymentData.type}
                  onChange={(e) => setPaymentData({ ...paymentData, type: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-sm"
                >
                  <option value="card">Card</option>
                  <option value="cash">Cash</option>
                  <option value="bkash">bKash</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Last 4 Digits</label>
                <input
                  type="text"
                  value={paymentData.last4}
                  onChange={(e) => setPaymentData({ ...paymentData, last4: e.target.value.slice(0, 4) })}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-sm"
                  placeholder="1234"
                  maxLength="4"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddPaymentMethod}
              disabled={addingPayment || !paymentData.name}
              className="w-full bg-foreground hover:opacity-90 text-background py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {addingPayment ? "Adding..." : "Add Payment Method"}
            </button>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-muted mb-1.5" htmlFor="paymentMethodId">
              Payment Method
            </label>
            <select
              className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
              id="paymentMethodId"
              name="paymentMethodId"
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              required
            >
              {userData?.authUser?.paymentMethods?.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.name} {method.last4 && `(•••• ${method.last4})`}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowPaymentForm(true)}
              className="text-xs text-accent hover:underline mt-1"
            >
              + Add new payment method
            </button>
          </div>
        )}

        {/* Start Date - Always visible */}
        <div>
          <label className="block text-sm font-medium text-muted mb-1.5" htmlFor="startDate">
            Start Date
          </label>
          <input
            type="date"
            name="startDate"
            id="startDate"
            max={new Date().toISOString().split('T')[0]}
            defaultValue={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
            required
          />
        </div>

        {/* Alert Checkbox */}
        <div className="flex items-start space-x-3 p-4 bg-accent/5 rounded-xl border border-accent/15">
          <input
            type="checkbox"
            id="alertEnabled"
            name="alertEnabled"
            className="mt-0.5 w-4 h-4 text-accent bg-surface border-border rounded focus:ring-accent focus:ring-2"
          />
          <label htmlFor="alertEnabled" className="text-sm text-foreground">
            Send me a reminder 1 day before renewal
          </label>
        </div>

        {/* Submit Button */}
        <button
          className="w-full bg-accent hover:bg-accent-hover text-accent-fg font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Subscription"}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
