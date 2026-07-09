import { mergeResolvers } from "@graphql-tools/merge";

import userResolver from "./user.resolver.js";
import transactionResolver from "./transaction.resolver.js";
import subscriptionResolver from "./subscription.resolver.js";
import exchangeRateResolver from "./exchangeRate.resolver.js";
import planResolver from "./plan.resolver.js";
import notificationResolver from "./notification.resolver.js";
import calendarResolver from "./calendar.resolver.js";
import aiResolver from "./ai.resolver.js";
import analyticsResolver from "./analytics.resolver.js";

const mergedResolvers = mergeResolvers([
  userResolver,
  transactionResolver,
  subscriptionResolver,
  exchangeRateResolver,
  planResolver,
  notificationResolver,
  calendarResolver,
  aiResolver,
  analyticsResolver,
])

export default mergedResolvers