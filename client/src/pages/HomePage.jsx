import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

import Cards from "../components/Cards";
import TransactionForm from "../components/TransactionForm";

import { MdLogout } from "react-icons/md";
import { useMutation, useQuery } from "@apollo/client/react";
import { LOGOUT } from "../graphql/mutations/user.mutation";
import { GET_AUTHENTICATED_USER } from "../graphql/queries/user.queries";
import { GET_TRANSACTION_STATISTICS } from "../graphql/queries/transaction.queries";
import { useEffect, useState } from "react";

ChartJS.register(ArcElement, Tooltip, Legend);

const HomePage = () => {
  const { data } = useQuery(GET_TRANSACTION_STATISTICS);
  const { data: authUserData } = useQuery(GET_AUTHENTICATED_USER);

  const [logout, { loading, client }] = useMutation(LOGOUT, {
    refetchQueries: ["GET_AUTHENTICATED_USER"],
  });

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

  // ✅ Chart.js plugin for center text
  const centerTextPlugin = {
    id: "centerText",
    afterDraw: (chart) => {
      const { width, height } = chart;
      const ctx = chart.ctx;

      ctx.save();
      ctx.fillStyle = "#fff"; // white text
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const dataset = chart.data.datasets[0];
      const total = dataset.data.reduce((sum, val) => sum + val, 0);

      const totalLabel = "Total";
      const totalValue = `$${total}`;

      const textX = width / 2;
      const textY = height / 2;

      // dynamic font sizes based on chart height
      const labelFontSize = height / 25; // smaller text
      const valueFontSize = height / 15; // larger text
      const lineSpacing = height / 30; // vertical gap

      // Label (above center)
      ctx.font = `${labelFontSize}px sans-serif`;
      ctx.fillText(totalLabel, textX, textY - lineSpacing);

      // Value (below center)
      ctx.font = `bold ${valueFontSize}px sans-serif`;
      ctx.fillText(totalValue, textX, textY + lineSpacing);

      ctx.restore();
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

  const handleLogout = async () => {
    try {
      await logout();
      client.resetStore();
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6 items-center max-w-7xl mx-auto z-20 relative justify-center">
        <div className="flex items-center">
          <p className="md:text-4xl text-2xl lg:text-4xl font-bold text-center relative z-50 mb-4 mr-4 bg-gradient-to-r from-pink-600 via-indigo-500 to-pink-400 inline-block text-transparent bg-clip-text">
            Spend wisely, track wisely
          </p>
          <img
            src={authUserData?.authUser.profilePicture}
            className="w-11 h-11 rounded-full border mr-2 cursor-pointer"
            alt="Avatar"
          />
          <p className="cursor-pointer" onClick={handleLogout}>
            Logout
          </p>
          {!loading && (
            <MdLogout
              className="mx-2 w-5 h-5 cursor-pointer"
              onClick={handleLogout}
            />
          )}
          {/* loading spinner */}
          {loading && (
            <div className="w-6 h-6 border-t-2 border-b-2 mx-2 rounded-full animate-spin"></div>
          )}
        </div>
        <div className="flex flex-wrap w-full justify-center items-center gap-6">
          {data?.categoryStatistics.length > 0 && (
            <div className="h-[330px] w-[330px] md:h-[360px] md:w-[360px]  ">
              <Doughnut data={chartData} plugins={[centerTextPlugin]} />
            </div>
          )}

          <TransactionForm />
        </div>
        <Cards />
      </div>
    </>
  );
};
export default HomePage;
