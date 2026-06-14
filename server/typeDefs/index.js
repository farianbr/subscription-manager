import { mergeTypeDefs } from "@graphql-tools/merge";

import userTypeDef from "./user.typeDef.js";
import transactionTypeDef from "./transaction.typeDef.js";
import subscriptionTypeDef from "./subscription.typeDef.js";
import exchangeRateTypeDef from "./exchangeRate.typeDef.js";

const mergedTypeDefs = mergeTypeDefs([
  userTypeDef,
  transactionTypeDef,
  subscriptionTypeDef,
  exchangeRateTypeDef,
]);

export default mergedTypeDefs;
