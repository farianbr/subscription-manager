import Transaction from "../models/transaction.model.js";
import User from "../models/user.model.js";

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
          historyMap[monthYear].totalSpent += transaction.costInDollar;
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
        const user = await context.getUser();
        if (!user) throw new Error("Unauthorized");

        const { serviceName, provider, category, costInDollar, billingCycle, billingDate, paymentMethodId } = input;

        // Get payment method name if provided
        let paymentMethodName = null;
        if (paymentMethodId) {
          const paymentMethod = user.paymentMethods.find(pm => pm.id === paymentMethodId);
          paymentMethodName = paymentMethod?.name || null;
        }

        const newTransaction = new Transaction({
          userId: user._id,
          subscriptionId: null, // Manual transaction has no subscription
          serviceName,
          provider,
          category,
          costInDollar,
          billingCycle: billingCycle || "monthly",
          billingDate: billingDate || new Date(),
          paymentMethodId,
          paymentMethodName,
        });

        await newTransaction.save();
        return newTransaction;
      } catch (err) {
        console.error("Error creating transaction:", err);
        throw new Error(err.message || "Error creating transaction");
      }
    },

    deleteTransaction: async (_, { transactionId }, context) => {
      try {
        const user = await context.getUser();
        if (!user) throw new Error("Unauthorized");

        const transaction = await Transaction.findById(transactionId);
        if (!transaction) throw new Error("Transaction not found");

        if (transaction.userId.toString() !== user._id.toString()) {
          throw new Error("Unauthorized to delete this transaction");
        }

        await Transaction.findByIdAndDelete(transactionId);
        return { message: "Transaction deleted successfully" };
      } catch (err) {
        console.error("Error deleting transaction:", err);
        throw new Error(err.message || "Error deleting transaction");
      }
    },
  },
};

export default transactionResolver;
