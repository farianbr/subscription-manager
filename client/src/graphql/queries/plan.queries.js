import { gql } from "@apollo/client";

export const GET_PLANS = gql`
  query GetPlans {
    plans {
      id
      name
      priceMonthly
      maxSubscriptions
      features
    }
  }
`;

export const GET_PLAN_USAGE = gql`
  query GetPlanUsage {
    planUsage {
      plan
      subscriptionCount
      subscriptionLimit
      features
    }
  }
`;
