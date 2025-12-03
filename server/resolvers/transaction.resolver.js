import Transaction from "../models/transaction.model.js";
import User from "../models/user.model.js";

const transactionResolver = {
  Query: {
    transactions: async (_, __, context) => {
      try {
        if (!context.getUser()) throw new Error("Unauthorized");
        const userId = await context.getUser()._id;

        const transactions = await Transaction.find({ 
          userId,
          status: "active" 
        }).sort({ createdAt: -1 });
        return transactions;
      } catch (err) {
        console.error("Error getting subscriptions:", err);
        throw new Error("Error getting subscriptions");
      }
    },
    transaction: async (_, { transactionId }) => {
      try {
        const transaction = await Transaction.findById(transactionId);
        return transaction;
      } catch (err) {
        console.error("Error getting subscription:", err);
        throw new Error("Error getting subscription");
      }
    },
    categoryStatistics: async (_, __, context) => {
      if (!context.getUser()) throw new Error("Unauthorized");

      const userId = context.getUser()._id;
      const transactions = await Transaction.find({ 
        userId,
        status: "active"
      });
      const categoryMap = {};

      transactions.forEach((transaction) => {
        if (!categoryMap[transaction.category]) {
          categoryMap[transaction.category] = 0;
        }
        categoryMap[transaction.category] += transaction.amount;
      });

      return Object.entries(categoryMap).map(([category, totalAmount]) => ({
        category,
        totalAmount,
      }));
    },
    monthlyHistory: async (_, __, context) => {
      try {
        if (!context.getUser()) throw new Error("Unauthorized");
        const userId = context.getUser()._id;

        const allTransactions = await Transaction.find({ userId }).sort({ createdAt: -1 });
        
        const historyMap = {};
        
        allTransactions.forEach((transaction) => {
          const date = new Date(transaction.createdAt);
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
  Mutation: {
    createTransaction: async (_, { input }, context) => {
      try {
        const newTransaction = new Transaction({
          ...input,
          userId: context.getUser()._id,
          renewalDate: input.renewalDate || input.endDate,
          status: "active",
        });
        await newTransaction.save();
        return newTransaction;
      } catch (err) {
        console.error("Error creating subscription:", err);
        throw new Error("Error creating subscription");
      }
    },
    updateTransaction: async (_, { input }) => {
      try {
        const updateData = { ...input };
        if (input.renewalDate) {
          updateData.endDate = input.renewalDate;
        }
        
        const updatedTransaction = await Transaction.findByIdAndUpdate(
          input.transactionId,
          updateData,
          { new: true }
        );
        return updatedTransaction;
      } catch (err) {
        console.error("Error updating subscription:", err);
        throw new Error("Error updating subscription");
      }
    },
    deleteTransaction: async (_, { transactionId }) => {
      try {
        const deletedTransaction = await Transaction.findByIdAndDelete(
          transactionId
        );
        return deletedTransaction;
      } catch (err) {
        console.error("Error deleting subscription:", err);
        throw new Error("Error deleting subscription");
      }
    },
    cancelSubscription: async (_, { transactionId }, context) => {
      try {
        if (!context.getUser()) throw new Error("Unauthorized");
        
        const canceledTransaction = await Transaction.findByIdAndUpdate(
          transactionId,
          { 
            status: "canceled",
            canceledAt: new Date()
          },
          { new: true }
        );
        
        return canceledTransaction;
      } catch (err) {
        console.error("Error canceling subscription:", err);
        throw new Error("Error canceling subscription");
      }
    },
  },
};

export default transactionResolver;
