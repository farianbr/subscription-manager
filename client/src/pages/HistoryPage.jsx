import { useQuery, useMutation } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";
import { GET_MONTHLY_HISTORY } from "../graphql/queries/transaction.queries";
import { DELETE_TRANSACTION } from "../graphql/mutations/transaction.mutation";
import { useCurrency } from "../context/CurrencyContext";
import { getCompanyLogo } from "../lib/companyLogos";
import { useState } from "react";
import toast from "react-hot-toast";
import Modal from "../components/ui/Modal";
import ManualTransactionForm from "../components/ManualTransactionForm";

const HistoryPage = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(GET_MONTHLY_HISTORY);
  const { formatCurrency } = useCurrency();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [deleteTransaction, { loading: deleting }] = useMutation(DELETE_TRANSACTION, {
    refetchQueries: ["GetMonthlyHistory"],
  });

  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return;
    try {
      await deleteTransaction({ variables: { transactionId: transactionToDelete } });
      toast.success("Transaction deleted successfully");
      setDeleteModalOpen(false);
      setTransactionToDelete(null);
    } catch (err) {
      toast.error(err.message);
      setDeleteModalOpen(false);
      setTransactionToDelete(null);
    }
  };

  const openDeleteModal = (transactionId) => {
    setTransactionToDelete(transactionId);
    setDeleteModalOpen(true);
  };

  const categoryColors = {
    saving: "bg-emerald-100 text-emerald-700",
    expense: "bg-pink-100 text-pink-700",
    investment: "bg-blue-100 text-blue-700",
  };

  // The month is already a string from the backend (e.g., "January", "February")
  // So we don't need to convert it anymore

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-2">Error loading history</p>
          <p className="text-slate-600">{error.message}</p>
        </div>
      </div>
    );
  }

  const monthlyHistory = data?.monthlyHistory || [];

  return (
    <div className="min-h-screen bg-slate-50 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Subscription History</h1>
              <p className="text-slate-600">View your month-by-month subscription breakdown</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add Transaction</span>
            </button>
          </div>
        </div>

        {/* Grand Total */}
        {monthlyHistory.length > 0 && (
          <div className="bg-white rounded-lg border-2 border-blue-200 shadow-md overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-700 mb-1">Grand Total</h2>
                  <p className="text-sm text-slate-600">Total spending across all months</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600">
                    {formatCurrency(monthlyHistory.reduce((total, month) => 
                      total + month.transactions.reduce((sum, t) => sum + t.costInDollar, 0), 0
                    ))}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    {monthlyHistory.reduce((total, month) => total + month.transactions.length, 0)} total transactions
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Monthly History */}
        {monthlyHistory.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No History Yet</h3>
            <p className="text-slate-600">You haven't added any subscriptions yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {monthlyHistory.map((month, idx) => (
              <div key={idx} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                
                {/* Month Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">
                      {month.month} {month.year}
                    </h2>
                  </div>
                </div>

                {/* Transactions List */}
                <div className="divide-y divide-slate-100">
                  {month.transactions.map((transaction) => (
                    <div key={transaction._id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between">
                        
                        {/* Transaction Info */}
                        <div className="flex items-center space-x-4 flex-1">
                          {/* Company Logo */}
                          {transaction.provider && getCompanyLogo(transaction.provider) ? (
                            <img 
                              src={getCompanyLogo(transaction.provider)} 
                              alt={transaction.serviceName}
                              className="w-10 h-10 rounded-lg object-contain bg-slate-100 p-1"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                              <span className="text-slate-400 text-lg font-bold">
                                {transaction.serviceName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}

                          {/* Details */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-1">
                              <h3 className="font-semibold text-slate-900">{transaction.serviceName}</h3>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColors[transaction.category] || "bg-slate-100 text-slate-700"}`}>
                                {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-slate-600">
                              <span>
                                <span className="text-slate-500">Billing:</span> {transaction.billingCycle || "monthly"}
                              </span>
                              <span>
                                <span className="text-slate-500">Date:</span> {new Date(parseInt(transaction.billingDate)).toLocaleDateString()}
                              </span>
                              {transaction.provider && (
                                <span>
                                  <span className="text-slate-500">Provider:</span> {transaction.provider}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Amount and Actions */}
                        <div className="flex items-center space-x-4 ml-4">
                          <div className="text-right">
                            <p className="text-lg font-bold text-slate-900">{formatCurrency(transaction.costInDollar)}</p>
                            {transaction.paymentMethodName && (
                              <p className="text-xs text-slate-500">Paid by: {transaction.paymentMethodName}</p>
                            )}
                          </div>
                          <button
                            onClick={() => openDeleteModal(transaction._id)}
                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete transaction"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Month Summary */}
                <div className="bg-slate-50 px-6 py-3 border-t border-slate-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">
                      {month.transactions.length} transaction{month.transactions.length !== 1 ? "s" : ""}
                    </span>
                    <span className="font-semibold text-slate-900">
                      Total: {formatCurrency(month.transactions.reduce((sum, t) => sum + t.costInDollar, 0))}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Add Manual Transaction"
      >
        <ManualTransactionForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={deleteModalOpen} 
        onClose={() => {
          setDeleteModalOpen(false);
          setTransactionToDelete(null);
        }}
        title="Delete Transaction"
      >
        <div className="space-y-4">
          <p className="text-slate-700">Are you sure you want to delete this transaction? This action cannot be undone.</p>
          <div className="flex space-x-3 justify-end">
            <button
              onClick={() => {
                setDeleteModalOpen(false);
                setTransactionToDelete(null);
              }}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteTransaction}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HistoryPage;
