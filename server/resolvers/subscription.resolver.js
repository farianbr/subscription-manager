import Subscription from "../models/subscription.model.js";
import Transaction from "../models/transaction.model.js";
import User from "../models/user.model.js";
import { calculateNextBillingDate } from "../utils/billing.js";
import { toUSD } from "../utils/exchangeRates.js";
import {
  requireString,
  requireEnum,
  requirePositiveAmount,
  requireDate,
  CATEGORIES,
  BILLING_CYCLES,
  CURRENCIES,
} from "../utils/validators.js";

// Validate and normalize the fields shared by create/update subscription inputs.
// In "update" mode, undefined fields are left untouched. Monetary fields
// (amount/currency) are validated but converted to USD by the caller.
function validateSubscriptionInput(input, { partial = false } = {}) {
  const clean = {};
  const has = (key) => input[key] !== undefined && input[key] !== null;

  if (!partial || has("serviceName"))
    clean.serviceName = requireString(input.serviceName, "Service name", { max: 100 });
  if (!partial || has("provider"))
    clean.provider = requireString(input.provider, "Provider", { max: 100 });
  if (!partial || has("category"))
    clean.category = requireEnum(input.category, CATEGORIES, "Category");
  if (!partial || has("amount"))
    clean.amount = requirePositiveAmount(input.amount, "Amount");
  if (!partial || has("billingCycle"))
    clean.billingCycle = requireEnum(input.billingCycle, BILLING_CYCLES, "Billing cycle");
  if (!partial || has("startDate"))
    clean.startDate = requireDate(input.startDate, "Start date");
  if (has("currency"))
    clean.currency = requireEnum(input.currency, CURRENCIES, "Currency");

  return clean;
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
        const user = await context.getUser();
        if (!user) throw new Error("Unauthorized");

        const clean = validateSubscriptionInput(input);
        const currency = clean.currency || user.currency || "USD";
        const costInDollar = await toUSD(clean.amount, currency);
        const nextBillingDate = calculateNextBillingDate(clean.startDate, clean.billingCycle);

        // Resolve payment method name if a (validated) paymentMethodId is provided
        let paymentMethodName = null;
        if (input.paymentMethodId) {
          const paymentMethod = user.paymentMethods.find((pm) => pm.id === input.paymentMethodId);
          if (!paymentMethod) throw new Error("Invalid payment method");
          paymentMethodName = paymentMethod.name;
        }

        const newSubscription = new Subscription({
          serviceName: clean.serviceName,
          provider: clean.provider,
          category: clean.category,
          billingCycle: clean.billingCycle,
          startDate: clean.startDate,
          costInDollar,
          originalAmount: clean.amount,
          originalCurrency: currency,
          currency,
          userId: user._id,
          nextBillingDate,
          paymentMethodId: input.paymentMethodId,
          alertEnabled: Boolean(input.alertEnabled),
          alertSentForCurrentCycle: false,
        });
        await newSubscription.save();

        // Create first transaction for this billing cycle
        const newTransaction = new Transaction({
          userId: user._id,
          subscriptionId: newSubscription._id,
          serviceName: clean.serviceName,
          provider: clean.provider,
          category: clean.category,
          costInDollar,
          originalAmount: clean.amount,
          originalCurrency: currency,
          billingCycle: clean.billingCycle,
          billingDate: clean.startDate,
          paymentMethodId: input.paymentMethodId,
          paymentMethodName,
        });
        await newTransaction.save();

        return newSubscription;
      } catch (err) {
        console.error("Error creating subscription:", err);
        throw new Error(err.message || "Error creating subscription");
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

        const clean = validateSubscriptionInput(input, { partial: true });
        const { amount, ...update } = clean;

        // Recompute the normalized USD value when amount and/or currency change.
        if (amount !== undefined || update.currency !== undefined) {
          const currency = update.currency || subscription.originalCurrency || subscription.currency || "USD";
          const originalAmount = amount !== undefined ? amount : subscription.originalAmount;
          if (originalAmount !== undefined && originalAmount !== null) {
            update.currency = currency;
            update.originalAmount = originalAmount;
            update.originalCurrency = currency;
            update.costInDollar = await toUSD(originalAmount, currency);
          }
        }

        if (input.alertEnabled !== undefined) {
          update.alertEnabled = Boolean(input.alertEnabled);
        }
        if (input.paymentMethodId !== undefined) {
          if (input.paymentMethodId) {
            const pm = user.paymentMethods.find((p) => p.id === input.paymentMethodId);
            if (!pm) throw new Error("Invalid payment method");
          }
          update.paymentMethodId = input.paymentMethodId;
        }

        // If startDate is being updated, recalculate nextBillingDate
        if (update.startDate) {
          const billingCycle = update.billingCycle || subscription.billingCycle;
          update.nextBillingDate = calculateNextBillingDate(update.startDate, billingCycle);
        }

        const updatedSubscription = await Subscription.findByIdAndUpdate(
          input.subscriptionId,
          { $set: update },
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
