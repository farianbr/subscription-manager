import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

import Cards from "../components/Cards";
import TransactionForm from "../components/TransactionForm";
import Modal from "../components/ui/Modal";

import { useQuery } from "@apollo/client/react";
import { GET_TRANSACTION_STATISTICS, GET_TRANSACTIONS } from "../graphql/queries/transaction.queries";
import { useEffect, useState } from "react";

ChartJS.register(ArcElement, Tooltip, Legend);

const HomePage = () => {
  const { data } = useQuery(GET_TRANSACTION_STATISTICS);
  const { data: transactionData } = useQuery(GET_TRANSACTIONS);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // ✅ Chart.js plugin for center text - removed for better UI
  const centerTextPlugin = {
    id: "centerText",
    afterDraw: () => {
      // No center text - total amount moved to category breakdown
    },
  };

  useEffect(() => {
    if (data?.categoryStatistics) {
      const categories = data.categoryStatistics.map((stat) => stat.category);
      const totalAmounts = data.categoryStatistics.map(
        (stat) => stat.totalAmount
      );
      const backgroundColors = [];
      const borderColors = [];

      categories.forEach((category) => {
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
  }, [data]);

  const calculateLastMonthSpending = () => {
    if (!transactionData?.transactions) return 0;
    
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return transactionData.transactions
      .filter(transaction => {
        // Calculate start date (30 days before end date)
        const endDate = new Date(parseInt(transaction.endDate));
        const startDate = new Date(endDate.getTime() - (30 * 24 * 60 * 60 * 1000));
        return startDate >= lastMonth && startDate < thisMonth;
      })
      .reduce((total, transaction) => total + transaction.amount, 0);
  };

  const getUpcomingRenewals = () => {
    if (!transactionData?.transactions) return [];
    
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return transactionData.transactions
      .filter(transaction => {
        const endDate = new Date(parseInt(transaction.endDate));
        return endDate >= now && endDate <= nextWeek;
      })
      .sort((a, b) => new Date(parseInt(a.endDate)) - new Date(parseInt(b.endDate)));
  };

  return (
    <>
      <div className="min-h-screen pb-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-slate-800 mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Subscription
              </span>{' '}
              <span className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Manager
              </span>
            </h1>
            <p className="text-slate-600 text-xl md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed mb-8">
              Professional subscription management made simple and elegant
            </p>
            <div className="flex items-center justify-center space-x-6 text-slate-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Real-time tracking</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">Smart alerts</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-medium">Detailed insights</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            
            {/* Chart Section - Enhanced */}
            <div className="lg:col-span-3">
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Spending Analytics</h2>
                    <p className="text-slate-600 mt-1">Track your subscription expenses by category</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Total Subscriptions</p>
                    <p className="text-2xl font-bold text-slate-800">{transactionData?.transactions?.length || 0}</p>
                  </div>
                </div>
                
                {data?.categoryStatistics.length > 0 ? (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-center">
                    {/* Chart */}
                    <div className="xl:col-span-2">
                      <div className="relative h-80 w-full flex items-center justify-center">
                        <Doughnut
                          data={chartData}
                          plugins={[centerTextPlugin]}
                          options={{
                            plugins: {
                              legend: {
                                position: 'bottom',
                                labels: {
                                  color: "#475569",
                                  font: {
                                    size: 14,
                                    weight: "600",
                                    family: "Inter, system-ui, sans-serif"
                                  },
                                  padding: 20,
                                  usePointStyle: true,
                                  pointStyle: 'circle',
                                },
                              },
                            },
                            maintainAspectRatio: false,
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Category Breakdown */}
                    <div className="space-y-4">
                      <div className="text-center mb-6">
                        <h3 className="font-semibold text-slate-800 mb-2">Total Amount</h3>
                        <p className="text-3xl font-bold text-slate-800">
                          ${data.categoryStatistics.reduce((total, stat) => total + stat.totalAmount, 0).toFixed(2)}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">All categories combined</p>
                      </div>
                      <div className="border-t border-slate-200 pt-4">
                        <h3 className="font-semibold text-slate-800 mb-4">Category Breakdown</h3>
                        {data.categoryStatistics.map((stat, index) => (
                          <div key={stat.category} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}
                              ></div>
                              <span className="capitalize text-slate-700 font-medium">{stat.category}</span>
                            </div>
                            <span className="font-bold text-slate-800">${stat.totalAmount.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">📊</div>
                    <p className="text-xl font-semibold text-slate-700 mb-2">No data yet</p>
                    <p className="text-slate-500">Add your first subscription to see analytics</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Insights Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            
            {/* Last Month Spending */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Last Month Spending</h3>
                  <p className="text-slate-600 text-sm">Based on subscription end dates</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-xl">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-slate-800 mb-2">
                  ${calculateLastMonthSpending().toFixed(2)}
                </p>
                <p className="text-slate-500">Total spent last month</p>
              </div>
            </div>

            {/* Upcoming Renewals */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Upcoming Renewals</h3>
                  <p className="text-slate-600 text-sm">Next 7 days</p>
                </div>
                <div className="bg-green-100 p-3 rounded-xl">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-3">
                {getUpcomingRenewals().length > 0 ? (
                  getUpcomingRenewals().slice(0, 3).map((renewal) => (
                    <div key={renewal._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-800">{renewal.description}</p>
                        <p className="text-sm text-slate-500">
                          {new Date(parseInt(renewal.endDate)).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="font-bold text-slate-800">${renewal.amount}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-slate-500">No renewals in the next 7 days</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Transactions Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Recent Subscriptions</h2>
                <p className="text-slate-600 mt-1">Manage your active subscriptions</p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live updates</span>
              </div>
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
