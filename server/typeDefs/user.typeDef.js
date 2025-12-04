const userTypeDef = `#graphql
    type User {
        _id: ID!
        email: String!
        name: String!
        password: String!
        gender: String!
        profilePicture: String
        currency: String
        paymentMethods: [PaymentMethod]
    }

    type PaymentMethod {
        id: String!
        name: String!
        type: String!
        last4: String
        isDefault: Boolean!
    }

    type Query {
        authUser: User
        user(userId: ID!): User
    }

    type Mutation {
        signUp(input: SignUpInput!): User
        login(input: LoginInput!): User
        logout: LogoutResponse
        updateProfile(input: UpdateProfileInput!): User
        updatePassword(input: UpdatePasswordInput!): User
        updateProfilePicture(profilePicture: String!): User
        addPaymentMethod(input: PaymentMethodInput!): User
        removePaymentMethod(paymentMethodId: String!): User
        setDefaultPaymentMethod(paymentMethodId: String!): User
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

    input UpdateProfileInput {
        name: String
        email: String
        currency: String
    }

    input UpdatePasswordInput {
        currentPassword: String!
        newPassword: String!
    }

    input PaymentMethodInput {
        name: String!
        type: String!
        last4: String
        isDefault: Boolean
    }

    type LogoutResponse{
        message: String!
    }

`;

export default userTypeDef;
