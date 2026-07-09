const aiTypeDef = `#graphql
    type AiInsight {
        title: String!
        detail: String!
        severity: String!
    }

    type AiInsights {
        generatedAt: String!
        summary: String!
        insights: [AiInsight!]!
    }

    type Query {
        # Whether the server has an AI provider configured (drives client UI).
        aiInsightsAvailable: Boolean!

        # Cached insights for the current subscription/transaction state, computed
        # on demand when stale. Null when there's no data to analyze or the
        # provider is unconfigured. Runs automatically on page load — no button.
        aiInsights: AiInsights
    }
`;

export default aiTypeDef;
