import { gql } from "@apollo/client";

export const CREATE_TRANSACTION = gql`
  mutation CreateTransaction($input: CreateTransactionInput!) {
    createTransaction(input: $input) {
      _id
      description
      paymentType
      category
      amount
      provider
      endDate
      alertEnabled
      alertSentForDateMinus1
      companyLogo
      billingCycle
      paymentMethodId
      renewalDate
      status
    }
  }
`;

export const UPDATE_TRANSACTION = gql`
  mutation UpdateTransaction($input: UpdateTransactionInput!) {
    updateTransaction(input: $input) {
      _id
      description
      paymentType
      category
      amount
      provider
      endDate
      alertEnabled
      alertSentForDateMinus1
      companyLogo
      billingCycle
      paymentMethodId
      renewalDate
      status
    }
  }
`;

export const DELETE_TRANSACTION = gql`
  mutation DeleteTransaction($transactionId: ID!) {
    deleteTransaction(transactionId: $transactionId) {
      _id
    }
  }
`;

export const CANCEL_SUBSCRIPTION = gql`
  mutation CancelSubscription($transactionId: ID!) {
    cancelSubscription(transactionId: $transactionId) {
      _id
      status
      canceledAt
    }
  }
`;