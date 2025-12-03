import { useQuery } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";
import { GET_MONTHLY_HISTORY } from "../graphql/queries/transaction.queries";
import { useCurrency } from "../context/CurrencyContext";

const HistoryPage = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(GET_MONTHLY_HISTORY);
  const { formatCurrency } = useCurrency();

  const categoryColors = {
    saving: "bg-emerald-100 text-emerald-700",
    expense: "bg-pink-100 text-pink-700",
    investment: "bg-blue-100 text-blue-700",
  };

  const getMonthName = (month) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[month - 1];
  };

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
    <div className="min-h-screen bg-slate-50 pb-8 pt-8">
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Subscription History</h1>
          <p className="text-slate-600">View your month-by-month subscription breakdown</p>
        </div>

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
                      {getMonthName(month.month)} {month.year}
                    </h2>
                    <div className="text-right">
                      <p className="text-sm text-slate-500 mb-1">Total Spent</p>
                      <p className="text-2xl font-bold text-slate-900">{formatCurrency(month.totalSpent)}</p>
                    </div>
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
                          {transaction.companyLogo ? (
                            <img 
                              src={transaction.companyLogo} 
                              alt={transaction.description}
                              className="w-10 h-10 rounded-lg object-contain bg-slate-100 p-1"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                              <span className="text-slate-400 text-lg font-bold">
                                {transaction.description.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}

                          {/* Details */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-1">
                              <h3 className="font-semibold text-slate-900">{transaction.description}</h3>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColors[transaction.category] || "bg-slate-100 text-slate-700"}`}>
                                {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
                              </span>
                              {transaction.status && (
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  transaction.status === "paid" ? "bg-green-100 text-green-700" :
                                  transaction.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                  "bg-red-100 text-red-700"
                                }`}>
                                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                </span>
                              )}
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

                        {/* Amount */}
                        <div className="text-right ml-4">
                          <p className="text-lg font-bold text-slate-900">{formatCurrency(transaction.amount)}</p>
                          {transaction.paymentMethodId && (
                            <p className="text-xs text-slate-500">Payment ID: {transaction.paymentMethodId.slice(0, 8)}...</p>
                          )}
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
                    <div className="flex items-center space-x-4">
                      <span className="text-green-600">
                        {month.transactions.filter(t => t.status === "paid").length} paid
                      </span>
                      <span className="text-yellow-600">
                        {month.transactions.filter(t => t.status === "pending").length} pending
                      </span>
                      <span className="text-red-600">
                        {month.transactions.filter(t => t.status === "failed").length} failed
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
