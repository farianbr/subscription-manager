import cron from "node-cron";
import Subscription from "../models/subscription.model.js";
import Transaction from "../models/transaction.model.js";
import User from "../models/user.model.js";
import { calculateNextBillingDate } from "../utils/billing.js";

// Run every day at midnight
export const billingCycleJob = cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Running billing cycle job...");
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find all subscriptions where nextBillingDate is today or past
    const dueSubscriptions = await Subscription.find({
      nextBillingDate: { $lte: today }
    });
    
    console.log(`Found ${dueSubscriptions.length} subscriptions due for billing`);
    
    for (const subscription of dueSubscriptions) {
      try {
        // Get payment method name if paymentMethodId exists
        let paymentMethodName = null;
        if (subscription.paymentMethodId) {
          const user = await User.findById(subscription.userId);
          const paymentMethod = user?.paymentMethods.find(pm => pm.id === subscription.paymentMethodId);
          paymentMethodName = paymentMethod?.name || null;
        }
        
        // Create a new transaction for this billing cycle
        const newTransaction = new Transaction({
          userId: subscription.userId,
          subscriptionId: subscription._id,
          serviceName: subscription.serviceName,
          provider: subscription.provider,
          category: subscription.category,
          costInDollar: subscription.costInDollar,
          originalAmount: subscription.originalAmount,
          originalCurrency: subscription.originalCurrency,
          billingCycle: subscription.billingCycle,
          billingDate: subscription.nextBillingDate,
          paymentMethodId: subscription.paymentMethodId,
          paymentMethodName: paymentMethodName,
        });
        
        await newTransaction.save();
        
        // Update subscription's next billing date
        const nextBillingDate = calculateNextBillingDate(
          subscription.nextBillingDate,
          subscription.billingCycle
        );
        
        subscription.nextBillingDate = nextBillingDate;
        subscription.alertSentForCurrentCycle = false; // Reset alert flag for new cycle
        await subscription.save();
        
        console.log(`Created transaction for subscription: ${subscription.serviceName}`);
      } catch (err) {
        console.error(`Error processing subscription ${subscription._id}:`, err);
      }
    }
    
    console.log("Billing cycle job completed");
  } catch (err) {
    console.error("Error in billing cycle job:", err);
  }
});

// Function to start the job
export function startBillingCycleJob() {
  billingCycleJob.start();
  console.log("Billing cycle job started - runs daily at midnight");
}

// Function to stop the job
export function stopBillingCycleJob() {
  billingCycleJob.stop();
  console.log("Billing cycle job stopped");
}
