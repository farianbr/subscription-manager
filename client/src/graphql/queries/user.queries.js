import { gql } from "@apollo/client";

export const GET_AUTHENTICATED_USER = gql`
  query GET_AUTHENTICATED_USER {
    authUser {
      _id
      name
      profilePicture
    }
  }
`;
