import Subscription from "../models/subscription.model.js";
import Transaction from "../models/transaction.model.js";

const subscriptionResolver = {
  Query: {
    subscriptions: async (_, __, context) => {
      try {
        if (!context.getUser()) throw new Error("Unauthorized");
        const userId = await context.getUser()._id;

        const subscriptions = await Subscription.find({ 
          userId,
          status: "active" 
        }).sort({ createdAt: -1 });
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
      const subscriptions = await Subscription.find({ 
        userId,
        status: "active"
      });
      const categoryMap = {};

      subscriptions.forEach((subscription) => {
        if (!categoryMap[subscription.category]) {
          categoryMap[subscription.category] = 0;
        }
        categoryMap[subscription.category] += subscription.amount;
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
        
        const newSubscription = new Subscription({
          ...input,
          userId: context.getUser()._id,
          startDate: input.startDate || new Date(),
          status: "active",
          alertSentForCurrentCycle: false,
        });
        await newSubscription.save();
        
        // Create first transaction for this billing cycle
        const newTransaction = new Transaction({
          userId: context.getUser()._id,
          subscriptionId: newSubscription._id,
          description: input.description,
          category: input.category,
          amount: input.amount,
          provider: input.provider,
          companyLogo: input.companyLogo,
          billingCycle: input.billingCycle,
          billingDate: input.startDate || new Date(),
          paymentMethodId: input.paymentMethodId,
          status: "paid",
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
    cancelSubscription: async (_, { subscriptionId }, context) => {
      try {
        if (!context.getUser()) throw new Error("Unauthorized");
        
        const canceledSubscription = await Subscription.findByIdAndUpdate(
          subscriptionId,
          { 
            status: "canceled",
            canceledAt: new Date()
          },
          { new: true }
        );
        
        return canceledSubscription;
      } catch (err) {
        console.error("Error canceling subscription:", err);
        throw new Error("Error canceling subscription");
      }
    },
    pauseSubscription: async (_, { subscriptionId }, context) => {
      try {
        if (!context.getUser()) throw new Error("Unauthorized");
        
        const pausedSubscription = await Subscription.findByIdAndUpdate(
          subscriptionId,
          { status: "paused" },
          { new: true }
        );
        
        return pausedSubscription;
      } catch (err) {
        console.error("Error pausing subscription:", err);
        throw new Error("Error pausing subscription");
      }
    },
    resumeSubscription: async (_, { subscriptionId }, context) => {
      try {
        if (!context.getUser()) throw new Error("Unauthorized");
        
        const resumedSubscription = await Subscription.findByIdAndUpdate(
          subscriptionId,
          { status: "active" },
          { new: true }
        );
        
        return resumedSubscription;
      } catch (err) {
        console.error("Error resuming subscription:", err);
        throw new Error("Error resuming subscription");
      }
    },
  },
};

export default subscriptionResolver;
