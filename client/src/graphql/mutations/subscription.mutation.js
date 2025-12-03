import { gql } from "@apollo/client";

export const CREATE_SUBSCRIPTION = gql`
  mutation CreateSubscription($input: CreateSubscriptionInput!) {
    createSubscription(input: $input) {
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
    }
  }
`;

export const UPDATE_SUBSCRIPTION = gql`
  mutation UpdateSubscription($input: UpdateSubscriptionInput!) {
    updateSubscription(input: $input) {
      _id
      description
      category
      amount
      provider
      companyLogo
      billingCycle
      nextBillingDate
      paymentMethodId
      status
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

export const CANCEL_SUBSCRIPTION = gql`
  mutation CancelSubscription($subscriptionId: ID!) {
    cancelSubscription(subscriptionId: $subscriptionId) {
      _id
      status
      canceledAt
    }
  }
`;

export const PAUSE_SUBSCRIPTION = gql`
  mutation PauseSubscription($subscriptionId: ID!) {
    pauseSubscription(subscriptionId: $subscriptionId) {
      _id
      status
    }
  }
`;

export const RESUME_SUBSCRIPTION = gql`
  mutation ResumeSubscription($subscriptionId: ID!) {
    resumeSubscription(subscriptionId: $subscriptionId) {
      _id
      status
    }
  }
`;
