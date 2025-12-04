import Subscription from "../models/subscription.model.js";
import Transaction from "../models/transaction.model.js";
import User from "../models/user.model.js";

// Helper function to calculate next billing date from start date
function calculateNextBillingDate(startDate, billingCycle) {
  const nextDate = new Date(startDate);
  
  switch (billingCycle) {
    case "weekly":
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case "monthly":
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case "yearly":
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    default:
      nextDate.setMonth(nextDate.getMonth() + 1);
  }
  
  return nextDate;
}

const subscriptionResolver = {
  Query: {
    subscriptions: async (_, __, context) => {
      try {
        if (!context.getUser()) throw new Error("Unauthorized");
        const userId = await context.getUser()._id;

        const subscriptions = await Subscription.find({ userId }).sort({ createdAt: -1 });
        return subscriptions;
      } catch (err) {
        console.error("Error getting subscriptions:", err);
        throw new Error("Error getting subscriptions");
      }
    },
    subscription: async (_, { subscriptionId }, context) => {
      try {
        if (!context.getUser()) throw new Error("Unauthorized");
        const subscription = await Subscription.findById(subscriptionId);
        return subscription;
      } catch (err) {
        console.error("Error getting subscription:", err);
        throw new Error("Error getting subscription");
      }
    },
    subscriptionStatistics: async (_, __, context) => {
      if (!context.getUser()) throw new Error("Unauthorized");

      const userId = context.getUser()._id;
      const subscriptions = await Subscription.find({ userId });
      const categoryMap = {};

      subscriptions.forEach((subscription) => {
        if (!categoryMap[subscription.category]) {
          categoryMap[subscription.category] = 0;
        }
        categoryMap[subscription.category] += subscription.costInDollar;
      });

      return Object.entries(categoryMap).map(([category, totalAmount]) => ({
        category,
        totalAmount,
      }));
    },
  },
  Mutation: {
    createSubscription: async (_, { input }, context) => {
      try {
        if (!context.getUser()) throw new Error("Unauthorized");
        
        const startDate = new Date(input.startDate);
        const nextBillingDate = calculateNextBillingDate(startDate, input.billingCycle);
        
        const newSubscription = new Subscription({
          ...input,
          userId: context.getUser()._id,
          startDate: startDate,
          nextBillingDate: nextBillingDate,
          alertSentForCurrentCycle: false,
        });
        await newSubscription.save();
        
        // Get payment method name if paymentMethodId is provided
        let paymentMethodName = null;
        if (input.paymentMethodId) {
          const user = await User.findById(context.getUser()._id);
          const paymentMethod = user.paymentMethods.find(pm => pm.id === input.paymentMethodId);
          paymentMethodName = paymentMethod?.name || null;
        }
        
        // Create first transaction for this billing cycle
        const newTransaction = new Transaction({
          userId: context.getUser()._id,
          subscriptionId: newSubscription._id,
          serviceName: input.serviceName,
          provider: input.provider,
          category: input.category,
          costInDollar: input.costInDollar,
          billingCycle: input.billingCycle,
          billingDate: startDate,
          paymentMethodId: input.paymentMethodId,
          paymentMethodName: paymentMethodName,
        });
        await newTransaction.save();
        
        return newSubscription;
      } catch (err) {
        console.error("Error creating subscription:", err);
        throw new Error("Error creating subscription");
      }
    },
    updateSubscription: async (_, { input }, context) => {
      try {
        if (!context.getUser()) throw new Error("Unauthorized");
        
        // If startDate is being updated, recalculate nextBillingDate
        if (input.startDate) {
          const subscription = await Subscription.findById(input.subscriptionId);
          const billingCycle = input.billingCycle || subscription.billingCycle;
          input.nextBillingDate = calculateNextBillingDate(new Date(input.startDate), billingCycle);
        }
        
        const updatedSubscription = await Subscription.findByIdAndUpdate(
          input.subscriptionId,
          { $set: input },
          { new: true }
        );
        return updatedSubscription;
      } catch (err) {
        console.error("Error updating subscription:", err);
        throw new Error("Error updating subscription");
      }
    },
    deleteSubscription: async (_, { subscriptionId }, context) => {
      try {
        if (!context.getUser()) throw new Error("Unauthorized");
        
        const deletedSubscription = await Subscription.findByIdAndDelete(
          subscriptionId
        );
        
        // Optionally delete associated transactions
        // await Transaction.deleteMany({ subscriptionId });
        
        return deletedSubscription;
      } catch (err) {
        console.error("Error deleting subscription:", err);
        throw new Error("Error deleting subscription");
      }
    },
  },
};

export default subscriptionResolver;
