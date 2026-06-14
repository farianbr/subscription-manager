import { gql } from "@apollo/client";

export const GET_SUBSCRIPTIONS = gql`
  query GetSubscriptions {
    subscriptions {
      _id
      serviceName
      provider
      category
      costInDollar
      originalAmount
      originalCurrency
      currency
      billingCycle
      startDate
      nextBillingDate
      paymentMethodId
      alertEnabled
      createdAt
    }
  }
`;
