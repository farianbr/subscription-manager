import Transaction from "../models/transaction.model.js";

const transactionResolver = {
  Query: {
    monthlyHistory: async (_, __, context) => {
      try {
        if (!context.getUser()) throw new Error("Unauthorized");
        const userId = context.getUser()._id;

        const allTransactions = await Transaction.find({ userId }).sort({ billingDate: -1 });
        
        const historyMap = {};
        
        allTransactions.forEach((transaction) => {
          const date = new Date(transaction.billingDate);
          const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (!historyMap[monthYear]) {
            historyMap[monthYear] = {
              month: date.toLocaleString('default', { month: 'long' }),
              year: date.getFullYear(),
              transactions: [],
              totalSpent: 0,
            };
          }
          
          historyMap[monthYear].transactions.push(transaction);
          historyMap[monthYear].totalSpent += transaction.amount;
        });

        return Object.values(historyMap).sort((a, b) => {
          return b.year - a.year || (new Date(b.month + ' 1, 2000') - new Date(a.month + ' 1, 2000'));
        });
      } catch (err) {
        console.error("Error getting monthly history:", err);
        throw new Error("Error getting monthly history");
      }
    },
  },
};

export default transactionResolver;
