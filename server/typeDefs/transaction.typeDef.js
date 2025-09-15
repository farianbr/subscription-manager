const transactionTypeDef = `#graphql
    type Transaction {
        _id: ID!
        userId: ID!
        description: String!
        paymentType: String!
        category: String!
        amount: Float!
        provider: String
        endDate: String!
        alertEnabled: Boolean!
        alertSentForDateMinus1: Boolean!
    }

    type Query {
        transactions: [Transaction!]
        transaction(transactionId: ID!): Transaction
        categoryStatistics: [CategoryStatistics!]
    }

    type Mutation {
        createTransaction(input: CreateTransactionInput!): Transaction!
        updateTransaction(input: UpdateTransactionInput!): Transaction!
        deleteTransaction(transactionId: ID!): Transaction!
    }

    type CategoryStatistics {
        category: String!
        totalAmount: Float!
    }

    input CreateTransactionInput {
        description: String!
        paymentType: String!
        category: String!
        amount: Float!
        endDate: String!
        provider: String
        alertEnabled: Boolean
        alertSentForDateMinus1: Boolean

    }

    input UpdateTransactionInput {
        transactionId: ID!
        description: String
        paymentType: String
        category: String
        amount: Float
        endDate: String
        provider: String
        alertEnabled: Boolean
        alertSentForDateMinus1: Boolean
    }
`;

export default transactionTypeDef;
