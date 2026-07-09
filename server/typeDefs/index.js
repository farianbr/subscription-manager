import { mergeTypeDefs } from "@graphql-tools/merge";

import userTypeDef from "./user.typeDef.js";
import transactionTypeDef from "./transaction.typeDef.js";
import subscriptionTypeDef from "./subscription.typeDef.js";
import exchangeRateTypeDef from "./exchangeRate.typeDef.js";
import planTypeDef from "./plan.typeDef.js";
import notificationTypeDef from "./notification.typeDef.js";
import calendarTypeDef from "./calendar.typeDef.js";
import aiTypeDef from "./ai.typeDef.js";
import analyticsTypeDef from "./analytics.typeDef.js";

const mergedTypeDefs = mergeTypeDefs([
  userTypeDef,
  transactionTypeDef,
  subscriptionTypeDef,
  exchangeRateTypeDef,
  planTypeDef,
  notificationTypeDef,
  calendarTypeDef,
  aiTypeDef,
  analyticsTypeDef,
]);

export default mergedTypeDefs;
