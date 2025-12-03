import { gql } from "@apollo/client";

export const GET_TRANSACTIONS = gql`
  query GetTransactions {
    transactions {
      _id
      description
      paymentType
      paymentMethodId
      category
      amount
      provider
      companyLogo
      billingCycle
      renewalDate
      endDate
      status
      alertEnabled
      alertSentForDateMinus1
      createdAt
    }
  }
`;

export const GET_TRANSACTION = gql`
  query GetTransaction($id: ID!) {
    transaction(transactionId: $id) {
      _id
      description
      paymentType
      paymentMethodId
      category
      amount
      provider
      companyLogo
      billingCycle
      renewalDate
      endDate
      status
      alertEnabled
      alertSentForDateMinus1
    }
  }
`;

export const GET_TRANSACTION_STATISTICS = gql`
  query GetTransactionStatistics {
    categoryStatistics {
      category
      totalAmount
    }
  }
`;

export const GET_MONTHLY_HISTORY = gql`
  query GetMonthlyHistory {
    monthlyHistory {
      month
      year
      totalSpent
      transactions {
        _id
        description
        paymentType
        category
        amount
        provider
        companyLogo
        billingCycle
        renewalDate
        status
        canceledAt
        createdAt
      }
    }
  }
`;
