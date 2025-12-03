import { useEffect, useState } from "react";
import TransactionFormSkeleton from "../components/skeletons/TransactionFormSkeleton";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  GET_TRANSACTION,
  GET_TRANSACTION_STATISTICS,
  GET_TRANSACTIONS,
} from "../graphql/queries/transaction.queries";
import { UPDATE_TRANSACTION } from "../graphql/mutations/transaction.mutation";
import toast from "react-hot-toast";

const TransactionPage = () => {
  const { id } = useParams();
  const { loading, data } = useQuery(GET_TRANSACTION, {
    variables: { id },
  });
  const navigate = useNavigate();
  const [updateTransaction, { loading: loadingUpdate }] = useMutation(
    UPDATE_TRANSACTION,
    {
      refetchQueries: [
        { query: GET_TRANSACTIONS },
        { query: GET_TRANSACTION_STATISTICS },
      ],
    }
  );

  const [formData, setFormData] = useState({
    description: data?.transaction?.description || "",
    paymentType: data?.transaction?.paymentType || "",
    category: data?.transaction?.category || "",
    amount: data?.transaction?.amount || "",
    provider: data?.transaction?.provider || "",
    endDate: data?.transaction?.endDate || "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    try {
      await updateTransaction({
        variables: {
          input: { transactionId: id, ...formData, amount },
        },
      });
      toast.success("Subscription updated.");
      navigate("/");
      // Ensure scroll to top after navigation
      setTimeout(() => window.scrollTo(0, 0), 100);
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (data) {
      setFormData({
        description: data?.transaction?.description,
        paymentType: data?.transaction?.paymentType,
        category: data?.transaction?.category,
        amount: data?.transaction?.amount,
        provider: data?.transaction?.provider,
        endDate: new Date(+data?.transaction?.endDate)
          .toISOString()
          .substr(0, 10),
      });
    }
  }, [data]);

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-sm border border-slate-200">
          <div className="text-center">
            <div className="w-12 h-12 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading subscription details...</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 pb-8 pt-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Back Button and Header */}
        <div className="mb-6">
          <button
            onClick={() => {
              navigate("/");
              setTimeout(() => window.scrollTo(0, 0), 100);
            }}
            className="flex items-center text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm border border-slate-200">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Edit Subscription
            </h1>
            <p className="text-slate-600">
              Update your subscription details
            </p>
          </div>

          {/* Form */}
          <form
            className="space-y-5"
            onSubmit={handleSubmit}
          >
            {/* Service Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="description">
                Service Name
              </label>
              <input
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                id="description"
                name="description"
                type="text"
                placeholder="e.g., Netflix, Spotify"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="amount">
                Monthly Cost
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
                  value={formData.amount}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Category & Payment Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="category">
                  Category
                </label>
                <select
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  id="category"
                  name="category"
                  onChange={handleInputChange}
                  value={formData.category}
                >
                  <option value="entertainment">Entertainment</option>
                  <option value="productivity">Productivity</option>
                  <option value="utilities">Utilities</option>
                  <option value="education">Education</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="paymentType">
                  Payment Method
                </label>
                <select
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  id="paymentType"
                  name="paymentType"
                  onChange={handleInputChange}
                  value={formData.paymentType}
                >
                  <option value="card">Card</option>
                  <option value="cash">Cash</option>
                  <option value="bkash">bKash</option>
                </select>
              </div>
            </div>

            {/* Provider and End Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="provider">
                  Provider (Optional)
                </label>
                <input
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  id="provider"
                  name="provider"
                  type="text"
                  placeholder="Company name"
                  value={formData.provider}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="endDate">
                  Renewal Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  id="endDate"
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={loadingUpdate}
              >
                {loadingUpdate ? "Updating..." : "Update Subscription"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default TransactionPage;
