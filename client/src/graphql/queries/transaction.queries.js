import { gql } from "@apollo/client";

export const GET_TRANSACTION_HISTORY = gql`
  query GetTransactionHistory($limit: Int, $offset: Int) {
    transactionHistory(limit: $limit, offset: $offset) {
      totalMonths
      totalTransactions
      grandTotal
      hasMore
      months {
        month
        year
        totalSpent
        transactions {
          _id
          subscriptionId
          serviceName
          provider
          category
          costInDollar
          originalAmount
          originalCurrency
          billingCycle
          billingDate
          paymentMethodId
          paymentMethodName
        }
      }
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
  }
`;
