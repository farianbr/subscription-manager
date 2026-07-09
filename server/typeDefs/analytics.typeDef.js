const analyticsTypeDef = `#graphql
    type ForecastMonth {
        label: String!
        year: Int!
        month: Int!
        projectedUSD: Float!
    }

    type PriceChange {
        service: String!
        provider: String!
        fromUSD: Float!
        toUSD: Float!
        changePct: Float!
        direction: String!
        changedAt: String!
    }

    type AdvancedAnalytics {
        # Projected cash outflow per calendar month for the next 6 months, based
        # on each subscription's real billing schedule (not a flat average).
        forecast: [ForecastMonth!]!
        # Subscriptions whose charged amount changed over their transaction history.
        priceChanges: [PriceChange!]!
        averageMonthlyPerSubUSD: Float!
        projectedNextMonthUSD: Float!
    }

    type Query {
        advancedAnalytics: AdvancedAnalytics!
    }
`;

export default analyticsTypeDef;
