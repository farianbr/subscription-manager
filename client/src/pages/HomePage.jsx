import { Doughnut, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { Link } from "react-router-dom";

import Cards from "../components/Cards";
import TransactionForm from "../components/TransactionForm";
import Modal from "../components/ui/Modal";

import { useQuery } from "@apollo/client/react";
import { GET_SUBSCRIPTIONS } from "../graphql/queries/subscription.queries";
import { GET_MONTHLY_HISTORY } from "../graphql/queries/transaction.queries";
import { useEffect, useState } from "react";
import { useCurrency } from "../context/CurrencyContext";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const HomePage = () => {
  const { data: subscriptionData } = useQuery(GET_SUBSCRIPTIONS);
  const { data: historyData } = useQuery(GET_MONTHLY_HISTORY);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { formatCurrency, convertFromUSD, getCurrencySymbol } = useCurrency();

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "$",
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
        borderRadius: 30,
        spacing: 10,
        cutout: 120,
      },
    ],
  });

  const [providerChartData, setProviderChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "$",
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
        borderRadius: 30,
        spacing: 10,
        cutout: 120,
      },
    ],
  });

  useEffect(() => {
    if (historyData?.monthlyHistory && historyData.monthlyHistory.length > 0) {
      // Get all transactions from history
      const allTransactions = historyData.monthlyHistory.flatMap(month => month.transactions);
      
      if (allTransactions.length === 0) return;
      
      // Group by category
      const categoryMap = {};
      allTransactions.forEach((transaction) => {
        if (!categoryMap[transaction.category]) {
          categoryMap[transaction.category] = 0;
        }
        categoryMap[transaction.category] += transaction.costInDollar;
      });

      // Color mapping for categories
      const categoryColors = {
        productivity: "rgba(75, 192, 192)",
        entertainment: "rgba(255, 99, 132)",
        utilities: "rgba(54, 162, 235)",
        education: "rgba(255, 206, 86)",
      };

      const categories = Object.keys(categoryMap).map(cat => 
        cat.charAt(0).toUpperCase() + cat.slice(1)
      );
      const totalAmounts = Object.values(categoryMap).map(amount => convertFromUSD(amount));
      const colors = Object.keys(categoryMap).map(cat => 
        categoryColors[cat.toLowerCase()] || "rgba(150, 150, 150)"
      );

      setChartData({
        labels: categories,
        datasets: [
          {
            label: "$",
            data: totalAmounts,
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 1,
            borderRadius: 30,
            spacing: 10,
            cutout: 120,
          },
        ],
      });
    }
  }, [historyData, convertFromUSD]);

  // Generate provider chart data from transactions
  useEffect(() => {
    if (historyData?.monthlyHistory && historyData.monthlyHistory.length > 0) {
      // Get all transactions from history
      const allTransactions = historyData.monthlyHistory.flatMap(month => month.transactions);
      
      if (allTransactions.length === 0) return;
      
      // Group transactions by provider
      const providerMap = {};
      allTransactions.forEach((transaction) => {
        const provider = transaction.provider.charAt(0).toUpperCase() + transaction.provider.slice(1);
        if (!providerMap[provider]) {
          providerMap[provider] = 0;
        }
        providerMap[provider] += transaction.costInDollar;
      });

      const providers = Object.keys(providerMap);
      const amounts = Object.values(providerMap).map(amount => convertFromUSD(amount));
      
      // Single subtle color for all bars
      const barColor = "rgba(20, 30, 49, 0.7)"; // Blue with transparency
      const borderColor = "#151f30"; // Solid blue border

      setProviderChartData({
        labels: providers,
        datasets: [
          {
            label: "Spending",
            data: amounts,
            backgroundColor: barColor,
            borderColor: borderColor,
            borderWidth: 1,
            borderRadius: 6,
            barThickness: 20,
            maxBarThickness: 25,
          },
        ],
      });
    }
  }, [historyData, convertFromUSD]);

  // Calculate total cost of all active subscriptions (normalized to monthly)
  const getTotalActiveCost = () => {
    if (!subscriptionData?.subscriptions) return 0;
    
    const cycleMultipliers = {
      weekly: 4,
      monthly: 1,
      yearly: 1/12
    };
    
    return subscriptionData.subscriptions.reduce((total, sub) => {
      const multiplier = cycleMultipliers[sub.billingCycle] || 1;
      return total + (sub.costInDollar * multiplier);
    }, 0);
  };

  // Get last month's bill from transaction history
  const getLastMonthBill = () => {
    if (!historyData?.monthlyHistory) return 0;
    
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Find the month data
    const lastMonthData = historyData.monthlyHistory.find(month => 
      month.month === monthNames[lastMonth.getMonth()] && 
      month.year === lastMonth.getFullYear()
    );
    
    return lastMonthData?.totalSpent || 0;
  };

  // Get next billing date from subscriptions
  const getNextBillingDate = () => {
    if (!subscriptionData?.subscriptions || subscriptionData.subscriptions.length === 0) {
      return null;
    }

    // Find the subscription with the earliest next billing date
    const nextBilling = subscriptionData.subscriptions.reduce((earliest, sub) => {
      const subDate = new Date(parseInt(sub.nextBillingDate));
      const earliestDate = earliest ? new Date(parseInt(earliest.nextBillingDate)) : null;
      
      if (!earliestDate || subDate < earliestDate) {
        return sub;
      }
      return earliest;
    }, null);

    return nextBilling;
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 pb-12">
        {/* Hero Section - Simplified */}
        <div className="bg-white border-b border-slate-200 py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                  Your Subscriptions
                </h1>
                <p className="text-slate-600 text-base sm:text-lg">
                  Track and manage your recurring expenses in one place
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Link
                  to="/history"
                  className="hidden sm:flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-3 rounded-lg font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>History</span>
                </Link>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="hidden sm:flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Subscription</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            {/* Quick Stats Cards */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-600">Active Subscriptions</h3>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {subscriptionData?.subscriptions?.length || 0}
              </p>
              <p className="text-sm text-slate-500 mt-1">Total services</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-600">Active Subscription Cost</h3>
                <div className="p-2 bg-green-50 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {formatCurrency(getTotalActiveCost())}
              </p>
              <p className="text-sm text-slate-500 mt-1">Monthly total</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-600">Last Month Bill</h3>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {formatCurrency(getLastMonthBill())}
              </p>
              <p className="text-sm text-slate-500 mt-1">As per transactions</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-600">Next Bill</h3>
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              {(() => {
                const nextBilling = getNextBillingDate();
                if (nextBilling) {
                  const nextDate = new Date(parseInt(nextBilling.nextBillingDate));
                  const day = nextDate.getDate();
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  const month = monthNames[nextDate.getMonth()];
                  const formattedDate = `${day} ${month}`;
                  
                  return (
                    <>
                      <p className="text-3xl font-bold text-slate-900">
                        {formatCurrency(nextBilling.costInDollar)}
                      </p>
                      <p className="text-sm text-slate-500 mt-1 capitalize">{nextBilling.serviceName} - {formattedDate}</p>
                    </>
                  );
                } else {
                  return (
                    <>
                      <p className="text-3xl font-bold text-slate-900">--</p>
                      <p className="text-sm text-slate-500 mt-1">No Upcoming Bills</p>
                    </>
                  );
                }
              })()}
            </div>
          </div>

          {/* Spending Overview Charts */}
          {historyData?.monthlyHistory && historyData.monthlyHistory.length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Spending Overview</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Spending by Provider - Bar Chart */}
                {providerChartData.labels && providerChartData.labels.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">By Provider</h3>
                    <div className="h-80">
                      <Bar
                        data={providerChartData}
                        options={{
                          indexAxis: 'y',
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: false,
                            },
                            tooltip: {
                              callbacks: {
                                label: (context) => {
                                  const value = context.parsed.x || 0;
                                  return `${getCurrencySymbol()}${value.toFixed(2)}`;
                                }
                              }
                            }
                          },
                          scales: {
                            x: {
                              beginAtZero: true,
                              grid: {
                                color: 'rgba(0, 0, 0, 0.05)',
                              },
                              ticks: {
                                callback: function(value) {
                                  return getCurrencySymbol() + value;
                                }
                              }
                            },
                            y: {
                              grid: {
                                display: false,
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Spending by Category - Doughnut Chart */}
                {chartData.labels && chartData.labels.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">By Category</h3>
                    <div className="h-80 flex items-center justify-center">
                      <Doughnut
                        data={chartData}
                        options={{
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: {
                                color: "#475569",
                                font: {
                                  size: 13,
                                  family: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif"
                                },
                                padding: 16,
                                usePointStyle: true,
                                pointStyle: 'circle',
                              },
                            },
                            tooltip: {
                              callbacks: {
                                label: (context) => {
                                  const label = context.label || '';
                                  const value = context.parsed || 0;
                                  return `${label}: ${getCurrencySymbol()}${value.toFixed(2)}`;
                                }
                              }
                            }
                          },
                          maintainAspectRatio: false,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subscriptions List */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Active Subscriptions</h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="sm:hidden flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add</span>
              </button>
            </div>
            <Cards onAddNew={() => setIsModalOpen(true)} />
          </div>
        </div>
      </div>

      {/* Add Subscription Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Add New Subscription"
      >
        <TransactionForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </>
  );
};
export default HomePage;
