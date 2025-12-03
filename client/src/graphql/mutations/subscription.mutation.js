import { gql } from "@apollo/client";

export const CREATE_SUBSCRIPTION = gql`
  mutation CreateSubscription($input: CreateSubscriptionInput!) {
    createSubscription(input: $input) {
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
    }
  }
`;

export const UPDATE_SUBSCRIPTION = gql`
  mutation UpdateSubscription($input: UpdateSubscriptionInput!) {
    updateSubscription(input: $input) {
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
    }
  }
`;

export const DELETE_SUBSCRIPTION = gql`
  mutation DeleteSubscription($subscriptionId: ID!) {
    deleteSubscription(subscriptionId: $subscriptionId) {
      _id
    }
  }
`;
