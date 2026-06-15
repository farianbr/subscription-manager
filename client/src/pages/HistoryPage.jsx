import { useQuery, useMutation } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";
import { GET_TRANSACTION_HISTORY } from "../graphql/queries/transaction.queries";
import { DELETE_TRANSACTION } from "../graphql/mutations/transaction.mutation";
import { useCurrency } from "../context/CurrencyContext";
import { getCompanyLogo } from "../lib/companyLogos";
import { useState } from "react";
import toast from "react-hot-toast";
import Modal from "../components/ui/Modal";
import ManualTransactionForm from "../components/ManualTransactionForm";
import EditTransactionForm from "../components/EditTransactionForm";

const MONTHS_PER_PAGE = 6;

const HistoryPage = () => {
  const navigate = useNavigate();
  const { data, loading, error, fetchMore, networkStatus } = useQuery(GET_TRANSACTION_HISTORY, {
    variables: { limit: MONTHS_PER_PAGE, offset: 0 },
    notifyOnNetworkStatusChange: true,
  });
  const { formatCurrency } = useCurrency();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [deleteTransaction, { loading: deleting }] = useMutation(DELETE_TRANSACTION, {
    refetchQueries: ["GetTransactionHistory", "GetMonthlyHistory"],
  });

  const history = data?.transactionHistory;
  const loadingMore = networkStatus === 3; // fetchMore in flight

  const handleLoadMore = () => {
    fetchMore({
      variables: { offset: history.months.length },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          transactionHistory: {
            ...fetchMoreResult.transactionHistory,
            months: [
              ...prev.transactionHistory.months,
              ...fetchMoreResult.transactionHistory.months,
            ],
          },
        };
      },
    });
  };

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

  const openEditModal = (transaction) => {
    setTransactionToEdit(transaction);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setTransactionToEdit(null);
  };

  const categoryColors = {
    saving: "bg-emerald-500/15 text-emerald-500",
    expense: "bg-pink-500/15 text-pink-500",
    investment: "bg-sky-500/15 text-sky-500",
  };

  // The month is already a string from the backend (e.g., "January", "February")
  // So we don't need to convert it anymore

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-border border-t-accent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-2">Error loading history</p>
          <p className="text-muted">{error.message}</p>
        </div>
      </div>
    );
  }

  const monthlyHistory = history?.months || [];

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center text-muted hover:text-foreground font-medium transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Subscription History</h1>
              <p className="text-muted">View your month-by-month subscription breakdown</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center space-x-2 bg-accent hover:bg-accent-hover text-accent-fg px-4 py-2 rounded-lg font-medium text-sm shrink-0 self-start sm:self-auto"
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
          <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden mb-6">
            <div className="bg-surface-2 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">Grand Total</h2>
                  <p className="text-sm text-muted">Total spending across all months</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-accent">
                    {formatCurrency(history?.grandTotal || 0)}
                  </p>
                  <p className="text-sm text-muted mt-1">
                    {history?.totalTransactions || 0} total transactions
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Monthly History */}
        {monthlyHistory.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-border p-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-muted/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-foreground mb-2">No History Yet</h3>
            <p className="text-muted">You haven't added any subscriptions yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {monthlyHistory.map((month, idx) => (
              <div key={idx} className="bg-surface rounded-2xl border border-border overflow-hidden">
                
                {/* Month Header */}
                <div className="bg-surface-2 px-6 py-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground">
                      {month.month} {month.year}
                    </h2>
                  </div>
                </div>

                {/* Transactions List */}
                <div className="divide-y divide-border">
                  {month.transactions.map((transaction) => (
                    <div key={transaction._id} className="px-4 sm:px-6 py-3.5 sm:py-4 hover:bg-surface-2 transition-colors">
                      <div className="flex items-start gap-3 sm:gap-4">
                        {/* Company Logo */}
                        {transaction.provider && getCompanyLogo(transaction.provider) ? (
                          <img
                            src={getCompanyLogo(transaction.provider)}
                            alt={transaction.serviceName}
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-contain bg-surface-2 p-1 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-surface-2 flex items-center justify-center shrink-0">
                            <span className="text-muted text-base sm:text-lg font-bold">
                              {transaction.serviceName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          {/* Name + Category + Amount */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
                              <h3 className="font-semibold text-foreground truncate">{transaction.serviceName}</h3>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColors[transaction.category] || "bg-surface-2 text-muted"}`}>
                                {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
                              </span>
                            </div>
                            <p className="text-base sm:text-lg font-bold text-foreground shrink-0">{formatCurrency(transaction.costInDollar)}</p>
                          </div>

                          {/* Meta line */}
                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs sm:text-sm text-muted">
                            <span className="capitalize">{transaction.billingCycle || "monthly"}</span>
                            <span className="text-border">•</span>
                            <span>{new Date(parseInt(transaction.billingDate)).toLocaleDateString()}</span>
                            {transaction.provider && (
                              <>
                                <span className="text-border">•</span>
                                <span className="capitalize">{transaction.provider}</span>
                              </>
                            )}
                          </div>

                          {/* Footer: payment method + actions */}
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <span className="text-xs text-muted truncate">
                              {transaction.paymentMethodName ? `Paid by: ${transaction.paymentMethodName}` : ""}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => openEditModal(transaction)}
                                className="text-muted hover:text-accent p-1.5 hover:bg-accent/10 rounded-lg transition-colors"
                                title="Edit transaction"
                              >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => openDeleteModal(transaction._id)}
                                className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Delete transaction"
                              >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Month Summary */}
                <div className="bg-surface-2 px-6 py-3 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">
                      {month.transactions.length} transaction{month.transactions.length !== 1 ? "s" : ""}
                    </span>
                    <span className="font-semibold text-foreground">
                      Total: {formatCurrency(month.transactions.reduce((sum, t) => sum + t.costInDollar, 0))}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {history?.hasMore && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-2.5 bg-surface border border-border hover:bg-surface-2 text-foreground rounded-lg font-medium text-sm disabled:opacity-50"
                >
                  {loadingMore ? "Loading..." : "Load earlier months"}
                </button>
              </div>
            )}
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

      {/* Edit Transaction Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={closeEditModal}
        title="Edit Transaction"
      >
        <EditTransactionForm
          transaction={transactionToEdit}
          onSuccess={closeEditModal}
          onCancel={closeEditModal}
        />
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
          <p className="text-foreground">Are you sure you want to delete this transaction? This action cannot be undone.</p>
          <div className="flex space-x-3 justify-end">
            <button
              onClick={() => {
                setDeleteModalOpen(false);
                setTransactionToDelete(null);
              }}
              className="px-4 py-2 bg-surface-2 hover:bg-border text-foreground rounded-lg font-medium"
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
