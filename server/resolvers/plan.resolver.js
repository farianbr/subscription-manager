import { PLANS, PLAN_IDS, getPlanConfig } from "../config/plans.js";
import { startPlanChange } from "../services/billing.js";
import Subscription from "../models/subscription.model.js";
import { requireEnum } from "../utils/validators.js";

const planResolver = {
  Query: {
    plans: () => Object.values(PLANS),

    planUsage: async (_, __, context) => {
      const user = await context.getUser();
      if (!user) throw new Error("Unauthorized");

      const plan = getPlanConfig(user.plan);
      const subscriptionCount = await Subscription.countDocuments({ userId: user._id });

      return {
        plan: plan.id,
        subscriptionCount,
        subscriptionLimit: plan.maxSubscriptions,
        features: plan.features,
      };
    },
  },

  Mutation: {
    changePlan: async (_, { plan }, context) => {
      const user = await context.getUser();
      if (!user) throw new Error("Unauthorized");

      requireEnum(plan, PLAN_IDS, "Plan");
      return startPlanChange(user, plan);
    },
  },
};

export default planResolver;
