const transactionTypeDef = `#graphql
    type Transaction {
        _id: ID!
        userId: ID!
        description: String!
        paymentType: String!
        paymentMethodId: String
        category: String!
        amount: Float!
        provider: String
        companyLogo: String
        billingCycle: String!
        renewalDate: String!
        endDate: String!
        status: String!
        canceledAt: String
        alertEnabled: Boolean!
        alertSentForDateMinus1: Boolean!
        createdAt: String!
    }

    type Query {
        transactions: [Transaction!]
        transaction(transactionId: ID!): Transaction
        categoryStatistics: [CategoryStatistics!]
        monthlyHistory: [MonthlyHistory!]
    }

    type Mutation {
        createTransaction(input: CreateTransactionInput!): Transaction!
        updateTransaction(input: UpdateTransactionInput!): Transaction!
        deleteTransaction(transactionId: ID!): Transaction!
        cancelSubscription(transactionId: ID!): Transaction!
    }

    type CategoryStatistics {
        category: String!
        totalAmount: Float!
    }

    type MonthlyHistory {
        month: String!
        year: Int!
        transactions: [Transaction!]
        totalSpent: Float!
    }

    input CreateTransactionInput {
        description: String!
        paymentType: String!
        paymentMethodId: String
        category: String!
        amount: Float!
        renewalDate: String!
        endDate: String!
        provider: String
        companyLogo: String
        billingCycle: String
        alertEnabled: Boolean
        alertSentForDateMinus1: Boolean
    }

    input UpdateTransactionInput {
        transactionId: ID!
        description: String
        paymentType: String
        paymentMethodId: String
        category: String
        amount: Float
        renewalDate: String
        endDate: String
        provider: String
        companyLogo: String
        billingCycle: String
        alertEnabled: Boolean
        alertSentForDateMinus1: Boolean
    }
`;

export default transactionTypeDef;
