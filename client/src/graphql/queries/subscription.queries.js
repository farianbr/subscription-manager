import { gql } from "@apollo/client";

export const GET_SUBSCRIPTIONS = gql`
  query GetSubscriptions {
    subscriptions {
      _id
      description
      category
      amount
      provider
      companyLogo
      billingCycle
      nextBillingDate
      startDate
      paymentMethodId
      status
      alertEnabled
      alertSentForCurrentCycle
      createdAt
      updatedAt
    }
  }
`;

export const GET_SUBSCRIPTION = gql`
  query GetSubscription($id: ID!) {
    subscription(subscriptionId: $id) {
      _id
      description
      category
      amount
      provider
      companyLogo
      billingCycle
      nextBillingDate
      startDate
      paymentMethodId
      status
      alertEnabled
      alertSentForCurrentCycle
      createdAt
      updatedAt
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
