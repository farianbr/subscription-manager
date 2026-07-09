const calendarTypeDef = `#graphql
    type CalendarFeed {
        # Private URL that serves the user's renewals as an .ics feed.
        url: String!
        # webcal:// variant that calendar apps subscribe to directly.
        webcalUrl: String!
        token: String!
    }

    type GoogleCalendarStatus {
        # Whether Google integration is configured on the server at all.
        configured: Boolean!
        connected: Boolean!
        email: String
        connectedAt: String
    }

    type SyncResult {
        synced: Int!
    }

    type Query {
        calendarFeed: CalendarFeed!
        googleCalendarStatus: GoogleCalendarStatus!
    }

    type Mutation {
        # Rotate the feed token, invalidating any previously shared URL.
        regenerateCalendarToken: CalendarFeed!
        # Push all existing subscriptions to the connected Google Calendar.
        syncGoogleCalendar: SyncResult!
        # Revoke Google access and stop syncing.
        disconnectGoogleCalendar: GoogleCalendarStatus!
    }
`;

export default calendarTypeDef;
