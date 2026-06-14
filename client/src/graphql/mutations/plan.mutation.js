import { gql } from "@apollo/client";

export const CHANGE_PLAN = gql`
  mutation ChangePlan($plan: String!) {
    changePlan(plan: $plan) {
      mode
      checkoutUrl
      user {
        _id
        plan
      }
    }
  }
`;
