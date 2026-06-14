const notificationTypeDef = `#graphql
    type Notification {
        _id: ID!
        type: String!
        title: String!
        message: String!
        subscriptionId: ID
        read: Boolean!
        createdAt: String!
    }

    type Query {
        notifications(limit: Int): [Notification!]!
        unreadNotificationCount: Int!
    }

    type Mutation {
        markNotificationRead(notificationId: ID!): Notification
        markAllNotificationsRead: MessageResponse!
    }
`;

export default notificationTypeDef;
