import Transaction from "../models/transaction.model.js";
import { toUSD } from "../utils/exchangeRates.js";
import {
  requireString,
  requireEnum,
  optionalEnum,
  requirePositiveAmount,
  requireDate,
  CATEGORIES,
  BILLING_CYCLES,
  CURRENCIES,
} from "../utils/validators.js";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Aggregation stages that group a user's transactions into months (newest first),
// summing the normalized USD cost and collecting each month's transactions.
function monthlyGroupStages() {
  return [
    { $sort: { billingDate: -1 } },
    {
      $group: {
        _id: {
          year: { $year: "$billingDate" },
          month: { $month: "$billingDate" },
        },
        transactions: { $push: "$$ROOT" },
        totalSpent: { $sum: "$costInDollar" },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
  ];
}

// Map an aggregation group into the GraphQL MonthlyHistory shape.
function shapeMonth(group) {
  return {
    month: MONTH_NAMES[group._id.month - 1],
    year: group._id.year,
    transactions: group.transactions,
    totalSpent: group.totalSpent,
  };
}

const transactionResolver = {
  Query: {
    // Full month-by-month history (used by the dashboard charts). Grouped in Mongo.
    monthlyHistory: async (_, __, context) => {
      try {
        const user = await context.getUser();
        if (!user) throw new Error("Unauthorized");

        const groups = await Transaction.aggregate([
          { $match: { userId: user._id } },
          ...monthlyGroupStages(),
        ]);

        return groups.map(shapeMonth);
      } catch (err) {
        console.error("Error getting monthly history:", err);
        throw new Error("Error getting monthly history");
      }
    },

    // Paginated month-by-month history with accurate overall totals (used by History page).
    transactionHistory: async (_, { limit = 6, offset = 0 }, context) => {
      try {
        const user = await context.getUser();
        if (!user) throw new Error("Unauthorized");

        const safeLimit = Math.min(Math.max(Number(limit) || 6, 1), 24);
        const safeOffset = Math.max(Number(offset) || 0, 0);

        const [result] = await Transaction.aggregate([
          { $match: { userId: user._id } },
          {
            $facet: {
              page: [...monthlyGroupStages(), { $skip: safeOffset }, { $limit: safeLimit }],
              summary: [
                {
                  $group: {
                    _id: null,
                    grandTotal: { $sum: "$costInDollar" },
                    totalTransactions: { $sum: 1 },
                  },
                },
              ],
              monthCount: [
                { $group: { _id: { year: { $year: "$billingDate" }, month: { $month: "$billingDate" } } } },
                { $count: "count" },
              ],
            },
          },
        ]);

        const summary = result.summary[0] || { grandTotal: 0, totalTransactions: 0 };
        const totalMonths = result.monthCount[0]?.count || 0;

        return {
          months: result.page.map(shapeMonth),
          totalMonths,
          grandTotal: summary.grandTotal,
          totalTransactions: summary.totalTransactions,
          hasMore: safeOffset + result.page.length < totalMonths,
        };
      } catch (err) {
        console.error("Error getting transaction history:", err);
        throw new Error("Error getting transaction history");
      }
    },
  },

  Mutation: {
    createTransaction: async (_, { input }, context) => {
      try {
        const user = await context.getUser();
        if (!user) throw new Error("Unauthorized");

        const serviceName = requireString(input.serviceName, "Service name", { max: 100 });
        const provider = requireString(input.provider, "Provider", { max: 100 });
        const category = requireEnum(input.category, CATEGORIES, "Category");
        const amount = requirePositiveAmount(input.amount, "Amount");
        const billingCycle = optionalEnum(input.billingCycle, BILLING_CYCLES, "Billing cycle") || "monthly";
        const billingDate = input.billingDate ? requireDate(input.billingDate, "Billing date") : new Date();
        const currency = input.currency
          ? requireEnum(input.currency, CURRENCIES, "Currency")
          : user.currency || "USD";
        const { paymentMethodId } = input;

        const costInDollar = await toUSD(amount, currency);

        // Get payment method name if provided
        let paymentMethodName = null;
        if (paymentMethodId) {
          const paymentMethod = user.paymentMethods.find(pm => pm.id === paymentMethodId);
          if (!paymentMethod) throw new Error("Invalid payment method");
          paymentMethodName = paymentMethod.name;
        }

        const newTransaction = new Transaction({
          userId: user._id,
          subscriptionId: null, // Manual transaction has no subscription
          serviceName,
          provider,
          category,
          costInDollar,
          originalAmount: amount,
          originalCurrency: currency,
          billingCycle,
          billingDate,
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
