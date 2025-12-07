import { gql } from "@apollo/client";

export const CREATE_TRANSACTION = gql`
  mutation CreateTransaction($input: CreateTransactionInput!) {
    createTransaction(input: $input) {
      _id
      subscriptionId
      serviceName
      provider
      category
      costInDollar
      billingCycle
      billingDate
      paymentMethodId
      paymentMethodName
    }
  }
`;

export const DELETE_TRANSACTION = gql`
  mutation DeleteTransaction($transactionId: ID!) {
    deleteTransaction(transactionId: $transactionId) {
      message
    }
  }
`;
