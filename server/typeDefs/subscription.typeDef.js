const subscriptionTypeDef = `#graphql
    type Subscription {
        _id: ID!
        userId: ID!
        serviceName: String!
        provider: String!
        category: String!
        costInDollar: Float!
        billingCycle: String!
        startDate: String!
        nextBillingDate: String!
        paymentMethodId: String
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
    }

    input CreateSubscriptionInput {
        serviceName: String!
        provider: String!
        category: String!
        costInDollar: Float!
        billingCycle: String!
        startDate: String!
        paymentMethodId: String
        alertEnabled: Boolean
    }

    input UpdateSubscriptionInput {
        subscriptionId: ID!
        serviceName: String
        provider: String
        category: String
        costInDollar: Float
        billingCycle: String
        startDate: String
        paymentMethodId: String
        alertEnabled: Boolean
    }
`;

export default subscriptionTypeDef;
