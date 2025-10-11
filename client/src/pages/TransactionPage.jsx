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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white/64 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full mx-auto mb-4" style={{ borderTop: '4px solid rgba(59,130,246,0.9)', borderRight: '4px solid rgba(59,130,246,0.15)', borderBottom: '4px solid rgba(59,130,246,0.15)', borderLeft: '4px solid rgba(59,130,246,0.15)', animation: 'spin 1s linear infinite' }} />
            <p className="text-slate-600 font-medium">Loading subscription details...</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen pb-8 pt-20 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Back Button and Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => {
              navigate("/");
              setTimeout(() => window.scrollTo(0, 0), 100);
            }}
            className="group flex items-center bg-white/70 backdrop-blur-sm hover:bg-white/90 text-slate-600 hover:text-slate-800 px-4 py-2 rounded-xl border border-white/30 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to Dashboard</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Edit Subscription
            </h1>
            <p className="text-slate-600 text-lg">
              Update your subscription details
            </p>
          </div>

          {/* Form */}
          <form
            className="max-w-2xl mx-auto space-y-6"
            onSubmit={handleSubmit}
          >
            {/* Service Description */}
            <div className="space-y-2">
              <label
                className="block text-slate-700 text-sm font-semibold"
                htmlFor="description"
              >
                Service Description
              </label>
              <input
                className="w-full bg-white/50 backdrop-blur-sm text-slate-800 border border-slate-200 rounded-xl py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-300 placeholder-slate-400"
                id="description"
                name="description"
                type="text"
                placeholder="Netflix Premium, Google One, etc."
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            {/* Payment Type, Category, Amount */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label
                  className="block text-slate-700 text-sm font-semibold"
                  htmlFor="paymentType"
                >
                  Payment Type
                </label>
                <div className="relative">
                  <select
                    className="w-full bg-white/50 backdrop-blur-sm text-slate-800 border border-slate-200 rounded-xl py-3 px-4 pr-8 leading-tight focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-300 appearance-none"
                    id="paymentType"
                    name="paymentType"
                    onChange={handleInputChange}
                    value={formData.paymentType}
                  >
                    <option value={"card"}>Card</option>
                    <option value={"cash"}>Cash</option>
                    <option value={"bkash"}>bKash</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  className="block text-slate-700 text-sm font-semibold"
                  htmlFor="category"
                >
                  Category
                </label>
                <div className="relative">
                  <select
                    className="w-full bg-white/50 backdrop-blur-sm text-slate-800 border border-slate-200 rounded-xl py-3 px-4 pr-8 leading-tight focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-300 appearance-none"
                    id="category"
                    name="category"
                    onChange={handleInputChange}
                    value={formData.category}
                  >
                    <option value={"entertainment"}>Entertainment</option>
                    <option value={"productivity"}>Productivity</option>
                    <option value={"utilities"}>Utilities</option>
                    <option value={"education"}>Education</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  className="block text-slate-700 text-sm font-semibold"
                  htmlFor="amount"
                >
                  Amount ($)
                </label>
                <input
                  className="w-full bg-white/50 backdrop-blur-sm text-slate-800 border border-slate-200 rounded-xl py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-300 placeholder-slate-400"
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  placeholder="150.00"
                  value={formData.amount}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Provider and End Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  className="block text-slate-700 text-sm font-semibold"
                  htmlFor="provider"
                >
                  Service Provider
                </label>
                <input
                  className="w-full bg-white/50 backdrop-blur-sm text-slate-800 border border-slate-200 rounded-xl py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-300 placeholder-slate-400"
                  id="provider"
                  name="provider"
                  type="text"
                  placeholder="Netflix, Google, etc."
                  value={formData.provider}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <label
                  className="block text-slate-700 text-sm font-semibold"
                  htmlFor="endDate"
                >
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  id="endDate"
                  className="w-full bg-white/50 backdrop-blur-sm text-slate-800 border border-slate-200 rounded-xl py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-300"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full sm:w-auto px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl transition-all duration-300"
              >
                Cancel
              </button>
              <button
                className="w-full sm:flex-1 relative group overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl"
                type="submit"
                disabled={loadingUpdate}
              >
                <span className="relative flex items-center justify-center">
                  {loadingUpdate ? (
                    <>
                      <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                      Updating Subscription...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Update Subscription
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default TransactionPage;
