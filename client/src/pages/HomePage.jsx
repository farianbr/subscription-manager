import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Link } from "react-router-dom";

import Cards from "../components/Cards";
import TransactionForm from "../components/TransactionForm";
import Modal from "../components/ui/Modal";

import { useQuery } from "@apollo/client/react";
import { GET_SUBSCRIPTION_STATISTICS } from "../graphql/queries/subscription.queries";
import { GET_SUBSCRIPTIONS } from "../graphql/queries/subscription.queries";
import { GET_MONTHLY_HISTORY } from "../graphql/queries/transaction.queries";
import { useEffect, useState } from "react";
import { useCurrency } from "../context/CurrencyContext";

ChartJS.register(ArcElement, Tooltip, Legend);

const HomePage = () => {
  const { data } = useQuery(GET_SUBSCRIPTION_STATISTICS);
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

  useEffect(() => {
    if (data?.subscriptionStatistics) {
      const categories = data.subscriptionStatistics.map((stat) => 
        stat.category.charAt(0).toUpperCase() + stat.category.slice(1)
      );
      const totalAmounts = data.subscriptionStatistics.map(
        (stat) => convertFromUSD(stat.totalAmount)
      );
      const backgroundColors = [];
      const borderColors = [];

      data.subscriptionStatistics.forEach((stat) => {
        const category = stat.category.toLowerCase();
        if (category === "productivity") {
          backgroundColors.push("rgba(75, 192, 192)");
          borderColors.push("rgba(75, 192, 192)");
        } else if (category === "entertainment") {
          backgroundColors.push("rgba(255, 99, 132)");
          borderColors.push("rgba(255, 99, 132)");
        } else if (category === "utilities") {
          backgroundColors.push("rgba(54, 162, 235)");
          borderColors.push("rgba(54, 162, 235)");
        } else if (category === "education") {
          backgroundColors.push("rgba(255, 206, 86)");
          borderColors.push("rgba(255, 206, 86)");
        }
      });

      setChartData((prev) => ({
        labels: categories,
        datasets: [
          {
            ...prev.datasets[0],
            data: totalAmounts,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
          },
        ],
      }));
    }
  }, [data, convertFromUSD]);

  const getCurrentMonthSpending = () => {
    if (!historyData?.monthlyHistory) return 0;
    
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // JS months are 0-indexed
    const currentYear = now.getFullYear();
    
    const currentMonthData = historyData.monthlyHistory.find(
      (month) => month.month === currentMonth && month.year === currentYear
    );
    
    return currentMonthData?.totalSpent || 0;
  };

  const getLastMonthSpending = () => {
    if (!historyData?.monthlyHistory) return 0;
    
    const now = new Date();
    const lastMonth = now.getMonth() === 0 ? 12 : now.getMonth(); // Handle January (0 -> December)
    const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    
    const lastMonthData = historyData.monthlyHistory.find(
      (month) => month.month === lastMonth && month.year === lastMonthYear
    );
    
    return lastMonthData?.totalSpent || 0;
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
                <h3 className="text-sm font-medium text-slate-600">Total Subscriptions</h3>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {subscriptionData?.subscriptions?.length || 0}
              </p>
              <p className="text-sm text-slate-500 mt-1">Active services</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-600">Total Monthly Cost</h3>
                <div className="p-2 bg-green-50 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {formatCurrency(data?.subscriptionStatistics ? data.subscriptionStatistics.reduce((total, stat) => total + stat.totalAmount, 0) : 0)}
              </p>
              <p className="text-sm text-slate-500 mt-1">All categories</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-600">This Month</h3>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {formatCurrency(getCurrentMonthSpending())}
              </p>
              <p className="text-sm text-slate-500 mt-1">Current spending</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-600">Last Month</h3>
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {formatCurrency(getLastMonthSpending())}
              </p>
              <p className="text-sm text-slate-500 mt-1">Previous spending</p>
            </div>
          </div>

          {/* Spending Overview Chart */}
          {data?.subscriptionStatistics && data.subscriptionStatistics.length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Spending by Category</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Chart */}
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
                
                {/* Category List */}
                <div className="space-y-3">
                  {data.subscriptionStatistics.map((stat, index) => {
                    const percentage = ((stat.totalAmount / data.subscriptionStatistics.reduce((t, s) => t + s.totalAmount, 0)) * 100).toFixed(1);
                    return (
                      <div key={stat.category} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}
                          ></div>
                          <span className="capitalize text-slate-700 font-medium">{stat.category}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">{formatCurrency(stat.totalAmount)}</p>
                          <p className="text-sm text-slate-500">{percentage}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
