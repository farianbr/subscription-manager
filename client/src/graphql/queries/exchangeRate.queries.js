import { gql } from "@apollo/client";

export const GET_EXCHANGE_RATES = gql`
  query GetExchangeRates {
    exchangeRates {
      base
      source
      fetchedAt
      rates {
        code
        rate
      }
    }
  }
`;
