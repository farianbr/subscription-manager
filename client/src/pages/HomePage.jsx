import { Doughnut, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";

import Cards from "../components/Cards";
import TransactionForm from "../components/TransactionForm";
import Modal from "../components/ui/Modal";

import { useQuery } from "@apollo/client/react";
import { GET_SUBSCRIPTIONS } from "../graphql/queries/subscription.queries";
import { GET_MONTHLY_HISTORY } from "../graphql/queries/transaction.queries";
import { useEffect, useState } from "react";
import { useCurrency } from "../context/CurrencyContext";
import { useTheme } from "../context/ThemeContext";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// Muted, theme-aware category palette (kept distinct but not loud).
const CATEGORY_COLORS = {
  productivity: "#34c759",
  entertainment: "#ff375f",
  utilities: "#0a84ff",
  education: "#ffd60a",
};

const HomePage = () => {
  const { data: subscriptionData } = useQuery(GET_SUBSCRIPTIONS);
  const { data: historyData } = useQuery(GET_MONTHLY_HISTORY);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { formatCurrency, convertFromUSD, getCurrencySymbol } = useCurrency();
  const { theme } = useTheme();

  const isDark = theme === "dark";
  const axisColor = isDark ? "#98989d" : "#6e6e73";
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const accent = isDark ? "#0a84ff" : "#0071e3";

  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [providerChartData, setProviderChartData] = useState({ labels: [], datasets: [] });

  // Category doughnut
  useEffect(() => {
    const months = historyData?.monthlyHistory;
    if (!months?.length) return;
    const allTransactions = months.flatMap((m) => m.transactions);
    if (!allTransactions.length) return;

    const categoryMap = {};
    allTransactions.forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.costInDollar;
    });

    const labels = Object.keys(categoryMap).map((c) => c.charAt(0).toUpperCase() + c.slice(1));
    const data = Object.values(categoryMap).map((a) => convertFromUSD(a));
    const colors = Object.keys(categoryMap).map((c) => CATEGORY_COLORS[c.toLowerCase()] || "#8e8e93");

    setChartData({
      labels,
      datasets: [
        {
          label: "$",
          data,
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 0,
          borderRadius: 24,
          spacing: 8,
          cutout: "72%",
        },
      ],
    });
  }, [historyData, convertFromUSD]);

  // Provider bar
  useEffect(() => {
    const months = historyData?.monthlyHistory;
    if (!months?.length) return;
    const allTransactions = months.flatMap((m) => m.transactions);
    if (!allTransactions.length) return;

    const providerMap = {};
    allTransactions.forEach((t) => {
      const provider = t.provider.charAt(0).toUpperCase() + t.provider.slice(1);
      providerMap[provider] = (providerMap[provider] || 0) + t.costInDollar;
    });

    setProviderChartData({
      labels: Object.keys(providerMap),
      datasets: [
        {
          label: "Spending",
          data: Object.values(providerMap).map((a) => convertFromUSD(a)),
          backgroundColor: accent,
          borderColor: accent,
          borderWidth: 0,
          borderRadius: 6,
          barThickness: 18,
          maxBarThickness: 24,
        },
      ],
    });
  }, [historyData, convertFromUSD, accent]);

  const getTotalActiveCost = () => {
    if (!subscriptionData?.subscriptions) return 0;
    const cycleMultipliers = { weekly: 4, monthly: 1, yearly: 1 / 12 };
    return subscriptionData.subscriptions.reduce(
      (total, sub) => total + sub.costInDollar * (cycleMultipliers[sub.billingCycle] || 1),
      0
    );
  };

  const getLastMonthBill = () => {
    if (!historyData?.monthlyHistory) return 0;
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    const lastMonthData = historyData.monthlyHistory.find(
      (m) => m.month === monthNames[lastMonth.getMonth()] && m.year === lastMonth.getFullYear()
    );
    return lastMonthData?.totalSpent || 0;
  };

  const getNextBillingDate = () => {
    const subs = subscriptionData?.subscriptions;
    if (!subs?.length) return null;
    return subs.reduce((earliest, sub) => {
      const subDate = new Date(parseInt(sub.nextBillingDate));
      const earliestDate = earliest ? new Date(parseInt(earliest.nextBillingDate)) : null;
      return !earliestDate || subDate < earliestDate ? sub : earliest;
    }, null);
  };

  const nextBilling = getNextBillingDate();
  const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const stats = [
    {
      label: "Active subscriptions",
      value: subscriptionData?.subscriptions?.length || 0,
      sub: "Total services",
    },
    {
      label: "Monthly cost",
      value: formatCurrency(getTotalActiveCost()),
      sub: "Normalized to monthly",
    },
    {
      label: "Last month",
      value: formatCurrency(getLastMonthBill()),
      sub: "As billed",
    },
    {
      label: "Next bill",
      value: nextBilling ? formatCurrency(nextBilling.costInDollar) : "—",
      sub: nextBilling
        ? `${nextBilling.serviceName} · ${new Date(parseInt(nextBilling.nextBillingDate)).getDate()} ${monthNamesShort[new Date(parseInt(nextBilling.nextBillingDate)).getMonth()]}`
        : "No upcoming bills",
    },
  ];

  const hasCharts = historyData?.monthlyHistory && historyData.monthlyHistory.length > 0;

  return (
    <>
      <div className="min-h-screen bg-background pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="flex items-end justify-between gap-3 pt-10 sm:pt-14 pb-8">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-foreground">
                Your Subscriptions
              </h1>
              <p className="text-muted mt-1.5 text-sm sm:text-base">
                Track and manage your recurring spending in one place.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="shrink-0 px-4 sm:px-5 py-2.5 rounded-full text-sm font-medium bg-accent hover:bg-accent-hover text-accent-fg transition-colors"
            >
              Add Subscription
            </button>
          </div>

          {/* Stat tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {stats.map((s) => (
              <div key={s.label} className="bg-surface rounded-2xl border border-border p-5">
                <p className="text-[13px] font-medium text-muted">{s.label}</p>
                <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mt-2">
                  {s.value}
                </p>
                <p className="text-xs text-muted mt-1 truncate capitalize">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          {hasCharts && (
            <div className="bg-surface rounded-2xl border border-border p-4 sm:p-6 mb-6">
              <h2 className="text-lg font-semibold tracking-tight text-foreground mb-6">Spending Overview</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {providerChartData.labels?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted mb-4">By Provider</h3>
                    <div className="h-64 sm:h-80">
                      <Bar
                        data={providerChartData}
                        options={{
                          indexAxis: "y",
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                            tooltip: {
                              callbacks: {
                                label: (c) => `${getCurrencySymbol()}${(c.parsed.x || 0).toFixed(2)}`,
                              },
                            },
                          },
                          scales: {
                            x: {
                              beginAtZero: true,
                              grid: { color: gridColor },
                              ticks: { color: axisColor, callback: (v) => getCurrencySymbol() + v },
                            },
                            y: { grid: { display: false }, ticks: { color: axisColor } },
                          },
                        }}
                      />
                    </div>
                  </div>
                )}

                {chartData.labels?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted mb-4">By Category</h3>
                    <div className="h-64 sm:h-80 flex items-center justify-center">
                      <Doughnut
                        data={chartData}
                        options={{
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "bottom",
                              labels: {
                                color: axisColor,
                                font: { size: 13 },
                                padding: 16,
                                usePointStyle: true,
                                pointStyle: "circle",
                              },
                            },
                            tooltip: {
                              callbacks: {
                                label: (c) => `${c.label}: ${getCurrencySymbol()}${(c.parsed || 0).toFixed(2)}`,
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subscriptions list */}
          <div className="bg-surface rounded-2xl border border-border p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">Active Subscriptions</h2>
            </div>
            <Cards onAddNew={() => setIsModalOpen(true)} />
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Subscription">
        <TransactionForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </>
  );
};

export default HomePage;
