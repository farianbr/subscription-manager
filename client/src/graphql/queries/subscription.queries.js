import { gql } from "@apollo/client";

export const GET_SUBSCRIPTIONS = gql`
  query GetSubscriptions {
    subscriptions {
      _id
      serviceName
      provider
      category
      costInDollar
      billingCycle
      startDate
      nextBillingDate
      paymentMethodId
      alertEnabled
      createdAt
    }
  }
`;

export const GET_SUBSCRIPTION = gql`
  query GetSubscription($id: ID!) {
    subscription(subscriptionId: $id) {
      _id
      serviceName
      provider
      category
      costInDollar
      billingCycle
      startDate
      nextBillingDate
      paymentMethodId
      alertEnabled
      createdAt
    }
  }
`;

export const GET_SUBSCRIPTION_STATISTICS = gql`
  query GetSubscriptionStatistics {
    subscriptionStatistics {
      category
      totalAmount
    }
  }
`;
