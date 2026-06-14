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
        const user = await context.getUser();
        if (!user) throw new Error("Unauthorized");

        // Verify the subscription exists and belongs to the caller
        const subscription = await Subscription.findById(input.subscriptionId);
        if (!subscription) throw new Error("Subscription not found");
        if (subscription.userId.toString() !== user._id.toString()) {
          throw new Error("Unauthorized to update this subscription");
        }

        // If startDate is being updated, recalculate nextBillingDate
        if (input.startDate) {
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
        throw new Error(err.message || "Error updating subscription");
      }
    },
    deleteSubscription: async (_, { subscriptionId }, context) => {
      try {
        const user = await context.getUser();
        if (!user) throw new Error("Unauthorized");

        // Verify the subscription exists and belongs to the caller
        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) throw new Error("Subscription not found");
        if (subscription.userId.toString() !== user._id.toString()) {
          throw new Error("Unauthorized to delete this subscription");
        }

        const deletedSubscription = await Subscription.findByIdAndDelete(
          subscriptionId
        );

        // Optionally delete associated transactions
        // await Transaction.deleteMany({ subscriptionId });

        return deletedSubscription;
      } catch (err) {
        console.error("Error deleting subscription:", err);
        throw new Error(err.message || "Error deleting subscription");
      }
    },
  },
};

export default subscriptionResolver;
