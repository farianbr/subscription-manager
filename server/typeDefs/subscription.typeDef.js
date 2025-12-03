const subscriptionTypeDef = `#graphql
    type Subscription {
        _id: ID!
        userId: ID!
        description: String!
        category: String!
        amount: Float!
        provider: String
        companyLogo: String
        billingCycle: String!
        nextBillingDate: String!
        startDate: String!
        paymentMethodId: String
        status: String!
        canceledAt: String
        alertEnabled: Boolean!
        alertSentForCurrentCycle: Boolean!
        createdAt: String!
        updatedAt: String!
    }

    type Query {
        subscriptions: [Subscription!]
        subscription(subscriptionId: ID!): Subscription
        subscriptionStatistics: [CategoryStatistics!]
    }

    type CategoryStatistics {
        category: String!
        totalAmount: Float!
    }

    type Mutation {
        createSubscription(input: CreateSubscriptionInput!): Subscription!
        updateSubscription(input: UpdateSubscriptionInput!): Subscription!
        deleteSubscription(subscriptionId: ID!): Subscription!
        cancelSubscription(subscriptionId: ID!): Subscription!
        pauseSubscription(subscriptionId: ID!): Subscription!
        resumeSubscription(subscriptionId: ID!): Subscription!
    }

    input CreateSubscriptionInput {
        description: String!
        category: String!
        amount: Float!
        provider: String
        companyLogo: String
        billingCycle: String!
        nextBillingDate: String!
        startDate: String!
        paymentMethodId: String
        alertEnabled: Boolean
    }

    input UpdateSubscriptionInput {
        subscriptionId: ID!
        description: String
        category: String
        amount: Float
        provider: String
        companyLogo: String
        billingCycle: String
        nextBillingDate: String
        paymentMethodId: String
        alertEnabled: Boolean
    }
`;

export default subscriptionTypeDef;
