const transactionTypeDef = `#graphql
    type Transaction {
        _id: ID!
        userId: ID!
        subscriptionId: ID
        serviceName: String!
        provider: String!
        category: String!
        costInDollar: Float!
        originalAmount: Float
        originalCurrency: String
        billingCycle: String!
        billingDate: String!
        paymentMethodId: String
        paymentMethodName: String
        createdAt: String!
        updatedAt: String!
    }

    type MonthlyHistory {
        month: String!
        year: Int!
        transactions: [Transaction!]
        totalSpent: Float!
    }

    type TransactionHistoryPage {
        months: [MonthlyHistory!]!
        totalMonths: Int!
        totalTransactions: Int!
        grandTotal: Float!
        hasMore: Boolean!
    }

    input CreateTransactionInput {
        serviceName: String!
        provider: String!
        category: String!
        amount: Float!
        currency: String
        billingCycle: String
        billingDate: String
        paymentMethodId: String
    }

    input UpdateTransactionInput {
        transactionId: ID!
        serviceName: String!
        provider: String!
        category: String!
        amount: Float!
        currency: String
        billingCycle: String
        billingDate: String
        paymentMethodId: String
    }

    type DeleteResponse {
        message: String!
    }

    type Query {
        monthlyHistory: [MonthlyHistory!]
        transactionHistory(limit: Int, offset: Int): TransactionHistoryPage!
    }

    type Mutation {
        createTransaction(input: CreateTransactionInput!): Transaction
        updateTransaction(input: UpdateTransactionInput!): Transaction
        deleteTransaction(transactionId: ID!): DeleteResponse
    }
`;

export default transactionTypeDef;
