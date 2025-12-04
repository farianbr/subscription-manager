const transactionTypeDef = `#graphql
    type Transaction {
        _id: ID!
        userId: ID!
        subscriptionId: ID!
        serviceName: String!
        provider: String!
        category: String!
        costInDollar: Float!
        billingCycle: String!
        billingDate: String!
        paymentMethodId: String
        paymentMethodName: String
        createdAt: String!
        updatedAt: String!
    }

    type Query {
        monthlyHistory: [MonthlyHistory!]
    }

    type MonthlyHistory {
        month: String!
        year: Int!
        transactions: [Transaction!]
        totalSpent: Float!
    }
`;

export default transactionTypeDef;
