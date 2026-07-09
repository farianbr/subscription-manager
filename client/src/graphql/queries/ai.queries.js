import { gql } from "@apollo/client";

export const AI_INSIGHTS_AVAILABLE = gql`
  query AiInsightsAvailable {
    aiInsightsAvailable
  }
`;

// Auto-generates on the server when the underlying data has changed; otherwise
// returns the cached result. No manual trigger.
export const GET_AI_INSIGHTS = gql`
  query GetAiInsights {
    aiInsights {
      generatedAt
      summary
      insights {
        title
        detail
        severity
      }
    }
  }
`;
