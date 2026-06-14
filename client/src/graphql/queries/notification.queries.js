import { gql } from "@apollo/client";

export const GET_NOTIFICATIONS = gql`
  query GetNotifications($limit: Int) {
    notifications(limit: $limit) {
      _id
      type
      title
      message
      subscriptionId
      read
      createdAt
    }
    unreadNotificationCount
  }
`;
