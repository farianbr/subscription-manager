import { UPDATE_SUBSCRIPTION } from "../graphql/mutations/subscription.mutation";
import { useMutation, useQuery } from "@apollo/client/react";
import { GET_AUTHENTICATED_USER } from "../graphql/queries/user.queries";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getCompanyOptions } from "../lib/companyLogos";

const EditSubscriptionForm = ({ subscription, onSuccess, onCancel }) => {
  const { data: userData } = useQuery(GET_AUTHENTICATED_USER);
  const [updateSubscription, { loading }] = useMutation(UPDATE_SUBSCRIPTION, {
    refetchQueries: ["GetSubscriptions"],
  });

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
      setCostInDollar(subscription.costInDollar?.toString() || "");
      setCategory(subscription.category || "entertainment");
      setBillingCycle(subscription.billingCycle || "monthly");
      setPaymentMethodId(subscription.paymentMethodId || "");
      setAlertEnabled(subscription.alertEnabled || false);
      
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
    
    const subscriptionData = {
      subscriptionId: subscription._id,
      serviceName: serviceName,
      provider: provider,
      category: category,
      costInDollar: parseFloat(costInDollar),
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

        {/* Custom Company Name (if "other" is selected) */}
        {selectedCompany === "other" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="customName">
              Company Name
            </label>
            <input
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              id="customName"
              name="customName"
              type="text"
              placeholder="Enter company name"
              value={customCompanyName}
              onChange={(e) => setCustomCompanyName(e.target.value)}
              required
            />
          </div>
        )}

        {/* Service Name (Optional) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="serviceName">
            Service Name (Optional)
          </label>
          <input
            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            id="serviceName"
            name="serviceName"
            type="text"
            placeholder="e.g., Premium, Pro, Business"
            value={serviceNameInput}
            onChange={(e) => setServiceNameInput(e.target.value)}
          />
        </div>

        {/* Amount and Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="amount">
              Cost ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
              <input
                className="w-full pl-7 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
        </div>

        {/* Billing Cycle and Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  {method.name} {method.last4 && `(•••• ${method.last4})${method.isDefault ? "*" : ""}`} 
                </option>
              ))}
            </select>
            {(!userData?.authUser?.paymentMethods || userData.authUser.paymentMethods.length === 0) && (
              <p className="text-xs text-slate-500 mt-1">
                Add payment methods in <Link to="/settings" state={{ tab: "payments" }} className="text-blue-600 hover:underline">Settings</Link>
              </p>
            )}
          </div>
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
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="alertEnabled"
            id="alertEnabled"
            checked={alertEnabled}
            onChange={(e) => setAlertEnabled(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="alertEnabled" className="text-sm text-slate-700">
            Enable renewal reminders
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
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
