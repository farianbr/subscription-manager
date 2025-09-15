import { CREATE_TRANSACTION } from "../graphql/mutations/transaction.mutation";
import { useMutation } from "@apollo/client/react";
import toast from "react-hot-toast";

const TransactionForm = () => {
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
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  return (
    <form
      className="w-full max-w-lg flex flex-col gap-5 px-3"
      onSubmit={handleSubmit}
    >
      {/* TRANSACTION */}
      <div className="flex flex-wrap">
        <div className="w-full">
          <label
            className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
            htmlFor="description"
          >
            Service Description
          </label>
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="description"
            name="description"
            type="text"
            required
            placeholder="Netflix premium, Google one, etc."
          />
        </div>
      </div>
      {/* PAYMENT TYPE */}
      <div className="flex flex-wrap gap-3">
        <div className="w-full flex-1 mb-6 md:mb-0">
          <label
            className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
            htmlFor="paymentType"
          >
            Payment Type
          </label>
          <div className="relative">
            <select
              className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              id="paymentType"
              name="paymentType"
            >
              <option value={"card"}>Card</option>
              <option value={"cash"}>Cash</option>
              <option value={"bkash"}>bKash</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
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
        <div className="w-full flex-1 mb-6 md:mb-0">
          <label
            className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
            htmlFor="category"
          >
            Category
          </label>
          <div className="relative">
            <select
              className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              id="category"
              name="category"
            >
              <option value={"entertainment"}>Entertainment</option>
              <option value={"productivity"}>Productivity</option>
              <option value={"utilities"}>Utilities</option>
              <option value={"education"}>Education</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
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
        <div className="w-full flex-1 mb-6 md:mb-0">
          <label
            className="block uppercase text-white text-xs font-bold mb-2"
            htmlFor="amount"
          >
            Amount($)
          </label>
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="amount"
            name="amount"
            type="number"
            placeholder="150"
          />
        </div>
      </div>

      {/* PROVIDER */}
      <div className="flex flex-wrap gap-3">
        <div className="w-full flex-1 mb-6 md:mb-0">
          <label
            className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
            htmlFor="provider"
          >
            Service Provider
          </label>
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border  rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
            id="provider"
            name="provider"
            type="text"
            placeholder="Netflix, Google, etc."
          />
        </div>

        {/* END DATE */}
        <div className="w-full flex-1">
          <label
            className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
            htmlFor="endDate"
          >
            End Date
          </label>
          <input
            type="date"
            name="endDate"
            id="endDate"
            className="appearance-none block w-full bg-gray-200 text-gray-700 border  rounded py-[11px] px-4 mb-3 leading-tight focus:outline-none
						 focus:bg-white"
            placeholder="Select date"
          />
        </div>
      </div>

      {/* ALERT ENABLED */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="alertEnabled"
          name="alertEnabled"
          className="w-4 h-4"
        />
        <label htmlFor="alertEnabled" className="text-white text-sm">
          Send me an alert 1 day before
        </label>
      </div>

      {/* SUBMIT BUTTON */}
      <button
        className="text-white font-bold w-full rounded px-4 py-2 bg-gradient-to-br
          from-pink-500 to-pink-500 hover:from-pink-600 hover:to-pink-600
						disabled:opacity-70 disabled:cursor-not-allowed"
        type="submit"
        disabled={loading}
      >
        {loading ? "Loading..." : "Add Subscription"}
      </button>
    </form>
  );
};

export default TransactionForm;
