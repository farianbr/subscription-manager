const userTypeDef = `#graphql
    type User {
        _id: ID!
        email: String!
        name: String!
        password: String!
        gender: String!
        profilePicture: String
    }

    type Query {
        authUser: User
        user(userId: ID!): User
    }

    type Mutation {
        signUp(input: SignUpInput!): User
        login(input: LoginInput!): User
        logout: LogoutResponse
    }

    input SignUpInput {
        email: String!
        name: String!
        password: String!
        gender: String!
    }

    input LoginInput {
        email: String!
        password: String!
    }

    type LogoutResponse{
        message: String!
    }

`;

export default userTypeDef;
