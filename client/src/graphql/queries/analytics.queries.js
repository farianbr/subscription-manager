import { gql } from "@apollo/client";

export const GET_ADVANCED_ANALYTICS = gql`
  query GetAdvancedAnalytics {
    advancedAnalytics {
      averageMonthlyPerSubUSD
      projectedNextMonthUSD
      forecast {
        label
        year
        month
        projectedUSD
      }
      priceChanges {
        service
        provider
        fromUSD
        toUSD
        changePct
        direction
        changedAt
      }
    }
  }
`;
