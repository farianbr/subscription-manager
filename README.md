# Subscription Manager

A web app for keeping track of what I'm subscribed to — the slow drip of Netflix,
Spotify, iCloud, and everything else — so I actually know what I'm paying and when
the next charge hits.

It's full-stack: React/Vite on the front, a GraphQL API (Apollo) over MongoDB on
the back. I built it like a real SaaS — plans, feature gating, a Stripe-shaped
billing seam — but in practice it's a single-user tool, so there's no team or
sharing machinery.

## What it does

Add your subscriptions (amount, currency, billing cycle, renewal date) and the
dashboard shows the monthly and annual damage, what's coming up, and where the
money goes by category and provider. A nightly cron advances billing cycles and
sends renewal reminders — email plus in-app notifications.

A couple of things I cared about getting right:

- **Multi-currency without losing precision.** You enter an amount in whatever
  currency; the server converts to USD using live rates (cached 12h, static
  fallback) and stores *both* the original and the normalized value, so nothing
  gets mangled by rounding. On screen, amounts are shown as whole numbers.
- **Gating that actually gates.** Free caps you at 10 subscriptions; Premium
  unlocks the rest. It's enforced on the server, not just hidden in the UI.

Premium adds:

- An **Insights** page: a 6-month spend forecast built from each subscription's
  real billing schedule (not a flat average), plus price-change detection pulled
  from your transaction history.
- **AI insights** — a short, plain-language read on your spending. It calls an
  OpenAI-compatible API (I use Groq), writes in your own currency, and caches the
  result, only regenerating when your data actually changes. No "generate" button
  to babysit.
- **Better reminders** — several lead times per renewal (a week before *and* the
  day before, say), not just one.
- **Calendar sync** — connect Google Calendar and your renewals show up as events
  that add, update, and remove themselves as you edit subscriptions. There's also
  a private `.ics` feed if you'd rather subscribe from Apple or Outlook.

## Running it locally

You'll need Node 20+ and a MongoDB connection string (Atlas works).

```bash
npm install
npm install --prefix client
cp .env.example .env          # fill in MONGO_URI and SESSION_SECRET at least

npm run dev                   # API on :4000
npm run dev --prefix client   # client on :5173, separate terminal
```

AI and Google Calendar are optional. Leave their keys blank and those features
just report "not configured" instead of breaking.

For production:

```bash
npm run build   # builds the client into client/dist
npm start       # serves the API and the built client
```

Tests are plain `node:test` (`npm test`). They cover the things that are easy to
get subtly wrong: input validation, billing-date math, plan gating, the iCal
builder, reminder lead-time resolution, and the token encryption / signed OAuth
state.

## Environment

The full list is in `.env.example`; these are the ones that matter:

| Variable | When you need it | What it's for |
| --- | --- | --- |
| `MONGO_URI` | always | MongoDB connection string |
| `SESSION_SECRET` | always | Signs sessions, and derives the key used to encrypt stored OAuth tokens |
| `APP_URL` | production | Public base URL — used to build the `.ics` feed and the Google OAuth redirect |
| `CLIENT_URL` | production | CORS origin and where OAuth redirects land |
| `GMAIL_USER` / `GMAIL_PASS` | for email | Gmail SMTP (use an App Password) |
| `AI_API_KEY` (+ `AI_BASE_URL`, `AI_MODEL`) | for AI insights | OpenAI-compatible key; defaults target Groq / `llama-3.3-70b-versatile` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | for calendar sync | OAuth client credentials |
| `STRIPE_SECRET_KEY` | for real billing | Unset = mock mode (plan changes apply immediately) |

Getting Google Calendar working is the fiddly part: create an OAuth 2.0 **Web
application** client in Google Cloud Console, enable the Calendar API, and add
`<APP_URL>/auth/google/calendar/callback` to its authorized redirect URIs — it
has to match exactly, trailing slashes and all. The scopes it asks for are
`openid`, `email`, and `calendar.events`.

## How it's laid out

The backend is a fairly standard Apollo setup. `server/config/plans.js` is the
single source of truth for what each plan includes, and `planGuard.js` enforces
it. Anything that talks to the outside world lives in `server/services/`
(billing, AI, Google Calendar) or `server/routes/` (the `.ics` feed and the OAuth
redirect flow, which sit outside GraphQL because they're plain redirects). Cron
jobs — billing rollover, reminders, keep-alive — are in `server/jobs/`.

The client is a Vite React app under `client/src/`: `pages/` for the routes,
`components/dashboard/` for the cards and charts, `context/` for currency and
theme, and `lib/` for the shared plan/feature hook and dashboard math.

## Rough edges

- Billing is mock-only for now — the Stripe seam exists (`services/billing.js`)
  but isn't wired to Checkout, so plan changes just take effect immediately.
- The client ships as one big bundle; code-splitting is on the list.
- It's single-user by design, so there's no multi-tenant hardening beyond the
  per-user ownership checks on every mutation.
