import { mergeResolvers } from "@graphql-tools/merge";

import userResolver from "./user.resolver.js";
import transactionResolver from "./transaction.resolver.js";
import subscriptionResolver from "./subscription.resolver.js";
import exchangeRateResolver from "./exchangeRate.resolver.js";

const mergedResolvers = mergeResolvers([
  userResolver,
  transactionResolver,
  subscriptionResolver,
  exchangeRateResolver,
])

export default mergedResolvers