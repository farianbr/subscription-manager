import { mergeResolvers } from "@graphql-tools/merge";

import userResolver from "./user.resolver.js";
import transactionResolver from "./transaction.resolver.js";
import subscriptionResolver from "./subscription.resolver.js";

const mergedResolvers = mergeResolvers([userResolver, transactionResolver, subscriptionResolver])

export default mergedResolvers