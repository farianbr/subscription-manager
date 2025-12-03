import { gql } from "@apollo/client";

export const GET_MONTHLY_HISTORY = gql`
  query GetMonthlyHistory {
    monthlyHistory {
      month
      year
      totalSpent
      transactions {
        _id
        subscriptionId
        description
        category
        amount
        provider
        companyLogo
        billingCycle
        billingDate
        status
        paymentMethodId
      }
    }
  }
`;
