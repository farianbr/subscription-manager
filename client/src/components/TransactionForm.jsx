import { CREATE_TRANSACTION } from "../graphql/mutations/transaction.mutation";
import { useMutation } from "@apollo/client/react";
import toast from "react-hot-toast";

const TransactionForm = ({ onSuccess }) => {
  const [createTransaction, { loading }] = useMutation(CREATE_TRANSACTION, {
    refetchQueries: ["GetTransactions", "GetTransactionStatistics"],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const transactionData = {
      description: formData.get("description"),
      paymentType: formData.get("paymentType"),
      category: formData.get("category"),
      amount: parseFloat(formData.get("amount") || "0"),
      provider: formData.get("provider"),
      endDate: formData.get("endDate"),
      alertEnabled: formData.get("alertEnabled") === "on",
    };
    try {
      await createTransaction({ variables: { input: transactionData } });

      form.reset();
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
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <form
          className="space-y-6"
          onSubmit={handleSubmit}
        >
          {/* TRANSACTION */}
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
              required
              placeholder="Netflix Premium, Google One, etc."
            />
          </div>

          {/* PAYMENT TYPE & CATEGORY & AMOUNT */}
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

            {/* CATEGORY */}
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

            {/* AMOUNT */}
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
              />
            </div>
          </div>

          {/* PROVIDER & END DATE */}
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
              />
            </div>

            {/* END DATE */}
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
              />
            </div>
          </div>

          {/* ALERT ENABLED */}
          <div className="flex items-center space-x-3 p-4 rounded-xl bg-slate-50/50 border border-slate-200">
            <input
              type="checkbox"
              id="alertEnabled"
              name="alertEnabled"
              className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="alertEnabled" className="text-slate-700 text-sm font-medium">
              Send me an alert 1 day before renewal
            </label>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            className="w-full relative group overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl"
            type="submit"
            disabled={loading}
          >
            <span className="relative flex items-center justify-center">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                  Adding Subscription...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Subscription
                </>
              )}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
