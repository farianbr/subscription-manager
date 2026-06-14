const planTypeDef = `#graphql
    type Plan {
        id: String!
        name: String!
        priceMonthly: Float!
        maxSubscriptions: Int
        maxMembers: Int!
        features: [String!]!
    }

    type PlanUsage {
        plan: String!
        subscriptionCount: Int!
        subscriptionLimit: Int
        features: [String!]!
    }

    type PlanChangeResult {
        user: User!
        checkoutUrl: String
        mode: String!
    }

    type Query {
        plans: [Plan!]!
        planUsage: PlanUsage!
    }

    type Mutation {
        changePlan(plan: String!): PlanChangeResult!
    }
`;

export default planTypeDef;
