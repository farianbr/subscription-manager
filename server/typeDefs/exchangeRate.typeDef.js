const exchangeRateTypeDef = `#graphql
    type CurrencyRate {
        code: String!
        rate: Float!
    }

    type ExchangeRates {
        base: String!
        source: String!
        fetchedAt: String!
        rates: [CurrencyRate!]!
    }

    type Query {
        exchangeRates: ExchangeRates!
    }
`;

export default exchangeRateTypeDef;
