import { UPDATE_SUBSCRIPTION } from "../graphql/mutations/subscription.mutation";
import { useMutation, useQuery } from "@apollo/client/react";
import { GET_AUTHENTICATED_USER } from "../graphql/queries/user.queries";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getCompanyOptions } from "../lib/companyLogos";
import { useCurrency } from "../context/CurrencyContext";

const EditSubscriptionForm = ({ subscription, onSuccess, onCancel }) => {
  const { data: userData } = useQuery(GET_AUTHENTICATED_USER);
  const { rates, convertToUSD } = useCurrency();
  const [updateSubscription, { loading }] = useMutation(UPDATE_SUBSCRIPTION, {
    refetchQueries: ["GetSubscriptions"],
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
  const [costInDollar, setCostInDollar] = useState("");
  const [category, setCategory] = useState("entertainment");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [alertEnabled, setAlertEnabled] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [initialized, setInitialized] = useState(false);
  
  const companyOptions = getCompanyOptions();

  // Initialize form with subscription data
  useEffect(() => {
    if (subscription && !initialized) {
      // Find matching company or set to "other"
      const matchingCompany = companyOptions.find(
        (opt) => opt.value.toLowerCase() === subscription.provider?.toLowerCase()
      );
      
      if (matchingCompany) {
        setSelectedCompany(matchingCompany.value);
        setCustomCompanyName("");
      } else {
        setSelectedCompany("other");
        setCustomCompanyName(subscription.provider || "");
      }

      // Set other fields
      setServiceNameInput(subscription.serviceName || "");
      const savedCurrency = subscription.currency || "USD";
      // Convert stored USD value to the subscription's currency for display
      const usdCost = subscription.costInDollar || 0;
      const rateForCurrency = rates[savedCurrency] || 1;
      const displayCost = usdCost * rateForCurrency;
      setCostInDollar(parseFloat(displayCost.toFixed(2)).toString());
      setCategory(subscription.category || "entertainment");
      setBillingCycle(subscription.billingCycle || "monthly");
      setPaymentMethodId(subscription.paymentMethodId || "");
      setAlertEnabled(subscription.alertEnabled || false);
      setCurrency(savedCurrency);
      
      // Format date for input field
      if (subscription.startDate) {
        const date = new Date(parseInt(subscription.startDate));
        if (!isNaN(date.getTime())) {
          setStartDate(date.toISOString().split('T')[0]);
        }
      }
      
      setInitialized(true);
    }
  }, [subscription, initialized, companyOptions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get provider name
    const provider = selectedCompany === "other" ? customCompanyName : selectedCompany;
    const serviceName = serviceNameInput || provider;
    
    // Convert the displayed cost (in selected currency) back to USD for storage
    const costInUSD = convertToUSD(parseFloat(costInDollar), currency);

    const subscriptionData = {
      subscriptionId: subscription._id,
      serviceName: serviceName,
      provider: provider,
      category: category,
      costInDollar: costInUSD,
      currency: currency,
      startDate: startDate,
      alertEnabled: alertEnabled,
      billingCycle: billingCycle,
      paymentMethodId: paymentMethodId || null,
    };
    
    try {
      await updateSubscription({ variables: { input: subscriptionData } });

      toast.success("Subscription updated successfully");
      
      // Call onSuccess callback to close modal
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.message);
    }
  };

  if (!subscription) return null;

  return (
    <div className="relative">
      <form className="space-y-5" onSubmit={handleSubmit}>

        {/* Company/Provider Selector */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="company">
            Select Provider
          </label>
          <select
            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="customName">
              Provider Name
            </label>
            <input
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="serviceName">
            Service Name (Optional)
          </label>
          <input
            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="currency">
              Currency
            </label>
            <select
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="amount">
              Cost
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm">
                {getCurrencySymbolFor(currency)}
              </span>
              <input
                className={`w-full pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${getCurrencySymbolFor(currency).length > 1 ? "pl-10" : "pl-7"}`}
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="9.99"
                value={costInDollar}
                onChange={(e) => setCostInDollar(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Category | Billing Cycle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="category">
              Category
            </label>
            <select
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="billingCycle">
              Billing Cycle
            </label>
            <select
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="paymentMethodId">
            Payment Method
          </label>
          <select
            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            id="paymentMethodId"
            name="paymentMethodId"
            value={paymentMethodId}
            onChange={(e) => setPaymentMethodId(e.target.value)}
            required
          >
            <option value="">Select Payment Method</option>
            {userData?.authUser?.paymentMethods?.map((method) => (
              <option key={method.id} value={method.id}>
                {method.name} {method.last4 && `(•••• ${method.last4})`}{method.isDefault ? " ★" : ""}
              </option>
            ))}
          </select>
          {(!userData?.authUser?.paymentMethods || userData.authUser.paymentMethods.length === 0) ? (
            <p className="text-xs text-slate-500 mt-1">
              Add payment methods in{" "}
              <Link to="/settings" state={{ tab: "payments" }} className="text-blue-600 hover:underline">
                Settings
              </Link>
            </p>
          ) : (
            <Link
              to="/settings"
              state={{ tab: "payments" }}
              className="text-xs text-blue-600 hover:underline mt-1 inline-block"
            >
              + Manage payment methods
            </Link>
          )}
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="startDate">
            Start Date
          </label>
          <input
            type="date"
            name="startDate"
            id="startDate"
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        {/* Alert Checkbox */}
        <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <input
            type="checkbox"
            name="alertEnabled"
            id="alertEnabled"
            checked={alertEnabled}
            onChange={(e) => setAlertEnabled(e.target.checked)}
            className="mt-0.5 w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label htmlFor="alertEnabled" className="text-sm text-slate-700">
            Send me a reminder 1 day before renewal
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Subscription"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditSubscriptionForm;
