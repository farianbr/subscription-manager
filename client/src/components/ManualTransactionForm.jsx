import { useMutation, useQuery } from "@apollo/client/react";
import { GET_AUTHENTICATED_USER } from "../graphql/queries/user.queries";
import { CREATE_TRANSACTION } from "../graphql/mutations/transaction.mutation";
import { ADD_PAYMENT_METHOD } from "../graphql/mutations/user.mutation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getCompanyOptions } from "../lib/companyLogos";
import { useCurrency } from "../context/CurrencyContext";

const ManualTransactionForm = ({ onSuccess }) => {
  const { data: userData } = useQuery(GET_AUTHENTICATED_USER);
  const { convertToUSD, rates } = useCurrency();
  const [createTransaction, { loading }] = useMutation(CREATE_TRANSACTION, {
    refetchQueries: ["GetMonthlyHistory"],
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
    
    const companyKey = formData.get("company");
    const provider = companyKey === "other" ? formData.get("customName") : companyKey;
    const serviceName = formData.get("serviceName") || provider;
    
    // Convert amount to USD
    const amountInSelectedCurrency = parseFloat(formData.get("amount") || "0");
    const costInUSD = convertToUSD(amountInSelectedCurrency, selectedCurrency);
    
    const transactionData = {
      serviceName: serviceName,
      provider: provider,
      category: formData.get("category"),
      costInDollar: costInUSD,
      billingCycle: formData.get("billingCycle") || "monthly",
      billingDate: formData.get("billingDate"),
      paymentMethodId: selectedPaymentMethod || null,
    };
    
    try {
      await createTransaction({ variables: { input: transactionData } });
      form.reset();
      setSelectedCompany("google");
      setCustomCompanyName("");
      toast.success("Transaction added successfully");
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Provider Selection */}
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
          >
            {companyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
            <option value="other">Other</option>
          </select>
        </div>

        {/* Custom Provider Name */}
        {selectedCompany === "other" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="customName">
              Provider Name
            </label>
            <input
              type="text"
              name="customName"
              id="customName"
              value={customCompanyName}
              onChange={(e) => setCustomCompanyName(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter service name"
              required={selectedCompany === "other"}
            />
          </div>
        )}

        {/* Service Name */}
        
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="serviceName">
              Service Name <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              name="serviceName"
              id="serviceName"
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="e.g., Premium Plan, Family Plan"
            />
          </div>
       

        {/* Category */}
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

        {/* Cost with Currency Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="currency">
              Currency
            </label>
            <select
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="amount">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">{getCurrencySymbolFor(selectedCurrency)}</span>
              <input
                type="number"
                name="amount"
                id="amount"
                step="0.01"
                min="0"
                className="w-full pl-7 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
                placeholder="9.99"
              />
            </div>
          </div>
        </div>

        {/* Billing Cycle */}
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

        {/* Payment Method Section */}
        {showPaymentForm ? (
          <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-700">Add Payment Method</h3>
              {userData?.authUser?.paymentMethods && userData.authUser.paymentMethods.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="text-xs text-slate-600 hover:text-slate-900"
                >
                  Use existing
                </button>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Method Name</label>
              <input
                type="text"
                value={paymentData.name}
                onChange={(e) => setPaymentData({ ...paymentData, name: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                placeholder="e.g., Visa Card"
                required={showPaymentForm}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
                <select
                  value={paymentData.type}
                  onChange={(e) => setPaymentData({ ...paymentData, type: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                >
                  <option value="card">Card</option>
                  <option value="cash">Cash</option>
                  <option value="bkash">bKash</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Last 4 Digits</label>
                <input
                  type="text"
                  value={paymentData.last4}
                  onChange={(e) => setPaymentData({ ...paymentData, last4: e.target.value.slice(0, 4) })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                  placeholder="1234"
                  maxLength="4"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddPaymentMethod}
              disabled={addingPayment || !paymentData.name}
              className="w-full bg-slate-700 hover:bg-slate-800 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {addingPayment ? "Adding..." : "Add Payment Method"}
            </button>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="paymentMethodId">
              Payment Method
            </label>
            <select
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              id="paymentMethodId"
              name="paymentMethodId"
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              required={!showPaymentForm}
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
              className="text-xs text-blue-600 hover:underline mt-1"
            >
              + Add new payment method
            </button>
          </div>
        )}

        {/* Billing Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="billingDate">
            Billing Date
          </label>
          <input
            type="date"
            name="billingDate"
            id="billingDate"
            max={new Date().toISOString().split('T')[0]}
            defaultValue={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Transaction"}
        </button>
      </form>
    </div>
  );
};

export default ManualTransactionForm;
