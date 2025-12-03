import { CREATE_TRANSACTION } from "../graphql/mutations/transaction.mutation";
import { useMutation, useQuery } from "@apollo/client/react";
import { GET_AUTHENTICATED_USER } from "../graphql/queries/user.queries";
import { useState } from "react";
import toast from "react-hot-toast";
import { getCompanyOptions, getCompanyLogo } from "../lib/companyLogos";

const TransactionForm = ({ onSuccess }) => {
  const { data: userData } = useQuery(GET_AUTHENTICATED_USER);
  const [createTransaction, { loading }] = useMutation(CREATE_TRANSACTION, {
    refetchQueries: ["GetTransactions", "GetTransactionStatistics"],
  });

  const [selectedCompany, setSelectedCompany] = useState("google");
  const [customCompanyName, setCustomCompanyName] = useState("");
  const companyOptions = getCompanyOptions();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    
    // Get company logo URL based on selection
    const companyKey = formData.get("company");
    const companyLogo = getCompanyLogo(companyKey);
    
    // Calculate renewalDate from endDate
    const endDateValue = formData.get("endDate");
    
    const transactionData = {
      description: companyKey === "other" ? formData.get("customName") : formData.get("company"),
      paymentType: "card", // Default value since we removed the field
      category: formData.get("category"),
      amount: parseFloat(formData.get("amount") || "0"),
      provider: formData.get("serviceName") || "",
      endDate: endDateValue,
      renewalDate: endDateValue, // Set renewalDate same as endDate initially
      alertEnabled: formData.get("alertEnabled") === "on",
      companyLogo: companyLogo,
      billingCycle: formData.get("billingCycle") || "monthly",
      paymentMethodId: formData.get("paymentMethodId") || null,
    };
    
    try {
      await createTransaction({ variables: { input: transactionData } });

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
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="amount">
            Cost
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
              required
            />
          </div>
        </div>

        {/* Category & Billing Cycle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="category">
              Category
            </label>
            <select
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="billingCycle">
              Billing Cycle
            </label>
            <select
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              id="billingCycle"
              name="billingCycle"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>

        {/* Payment Method (from user's saved methods) & Renewal Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="paymentMethodId">
              Payment Method
            </label>
            <select
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              id="paymentMethodId"
              name="paymentMethodId"
              required
            >
              <option value="">Select Payment Method</option>
              {userData?.authUser?.paymentMethods?.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.name} {method.last4 && `(•••• ${method.last4})`} {method.isDefault && "- Default"}
                </option>
              ))}
            </select>
            {(!userData?.authUser?.paymentMethods || userData.authUser.paymentMethods.length === 0) && (
              <p className="text-xs text-slate-500 mt-1">
                Add payment methods in <a href="/settings" className="text-blue-600 hover:underline">Settings</a>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="endDate">
              Next Renewal Date
            </label>
            <input
              type="date"
              name="endDate"
              id="endDate"
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>
        </div>

        {/* Alert Checkbox */}
        <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <input
            type="checkbox"
            id="alertEnabled"
            name="alertEnabled"
            className="mt-0.5 w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label htmlFor="alertEnabled" className="text-sm text-slate-700">
            Send me a reminder 1 day before renewal
          </label>
        </div>

        {/* Submit Button */}
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
