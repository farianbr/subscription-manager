import { gql } from "@apollo/client";

export const GET_CALENDAR_FEED = gql`
  query GetCalendarFeed {
    calendarFeed {
      url
      webcalUrl
      token
    }
  }
`;

export const REGENERATE_CALENDAR_TOKEN = gql`
  mutation RegenerateCalendarToken {
    regenerateCalendarToken {
      url
      webcalUrl
      token
    }
  }
`;

export const GOOGLE_CALENDAR_STATUS = gql`
  query GoogleCalendarStatus {
    googleCalendarStatus {
      configured
      connected
      email
      connectedAt
    }
  }
`;

export const SYNC_GOOGLE_CALENDAR = gql`
  mutation SyncGoogleCalendar {
    syncGoogleCalendar {
      synced
    }
  }
`;

export const DISCONNECT_GOOGLE_CALENDAR = gql`
  mutation DisconnectGoogleCalendar {
    disconnectGoogleCalendar {
      configured
      connected
      email
      connectedAt
    }
  }
`;
