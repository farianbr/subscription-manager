import { gql } from "@apollo/client";

export const GET_AUTHENTICATED_USER = gql`
  query GET_AUTHENTICATED_USER {
    authUser {
      _id
      name
      email
      profilePicture
      currency
      plan
      emailVerified
      notificationPreferences {
        emailReminders
        reminderDaysBefore
        productUpdates
      }
      paymentMethods {
        id
        name
        type
        last4
        isDefault
      }
    }
  }
`;
