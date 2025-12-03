const transactionTypeDef = `#graphql
    type Transaction {
        _id: ID!
        userId: ID!
        subscriptionId: ID!
        description: String!
        paymentMethodId: String
        category: String!
        amount: Float!
        provider: String
        companyLogo: String
        billingCycle: String!
        billingDate: String!
        status: String!
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
