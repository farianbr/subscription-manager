# 📊 Subscription Manager

A full-stack SaaS for tracking personal subscriptions — see what you pay, when it
renews, and where your money goes. Built with **GraphQL/Apollo + MongoDB** on the
backend and **React + Vite + Tailwind CSS** on the front end, with a typography-driven UI and full dark mode.

---

## ✨ Features

- **Authentication & accounts**
  - Email/password signup with session-cookie auth (Passport.js), bcrypt hashing.
  - Email verification (24h tokens), password reset, and account deletion with
    full data cascade.
  - Per-user notification preferences (email reminders, reminder lead time).

- **Subscriptions & history**
  - Create / edit / delete subscriptions with provider, category, billing cycle,
    payment method, and renewal date.
  - Month-by-month transaction history with server-side aggregation and pagination.
  - Automatic billing rollover and renewal reminders via scheduled cron jobs
    (email + in-app notifications).

- **Multi-currency**
  - 10 supported currencies (USD, EUR, GBP, INR, BDT, CAD, AUD, JPY, CHF, CNY).
  - The backend is the FX source of truth: live rates (cached 12h) with a static
    fallback. Amounts are stored non-lossily (original amount + currency **and** a
    normalized USD value).

- **Plans & monetization**
  - Free (up to 10 subscriptions), Premium, and Family tiers with feature gating.
  - Plan config is centralized in `server/config/plans.js`; billing is abstracted
    behind a Stripe-ready seam (`server/services/billing.js`).

- **Premium UX**
  - Light/dark themes (system-aware, persisted), restrained color, large whitespace.
  - Responsive dashboard with charts, loading skeletons, and toast feedback.

---

## 🛠️ Tech Stack

**Frontend:** React 19 (Vite), Apollo Client, React Router, Tailwind CSS v4,
Chart.js, React Hot Toast.

**Backend:** Node.js + Express 5, Apollo Server 5 (GraphQL), Passport.js,
bcryptjs, node-cron, Nodemailer (Gmail SMTP).

**Database:** MongoDB (Mongoose 8).

**Hardening:** Helmet, express-rate-limit (general + auth-specific), centralized
input validation, ownership checks on all mutations.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ (the test suite uses the built-in `node:test` runner)
- A MongoDB connection string (e.g. MongoDB Atlas)

### Setup

```bash
# 1. Install dependencies (root = server, plus the client)
npm install
npm install --prefix client

# 2. Configure environment
cp .env.example .env   # then fill in MONGO_URI, SESSION_SECRET, etc.

# 3. Run in development (server on :4000, client on :5173)
npm run dev                  # backend with nodemon
npm run dev --prefix client  # frontend (separate terminal)
```

### Production build & run

```bash
npm run build   # installs deps and builds the client into client/dist
npm start       # serves the API + built client (NODE_ENV=production)
```

### Tests

```bash
npm test        # runs the node:test suite (validators, billing, plans/gating)
```

---

## 🔐 Environment Variables

See [`.env.example`](.env.example) for the full list. Key ones:

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGO_URI` | ✅ | MongoDB connection string |
| `SESSION_SECRET` | ✅ | Express session signing secret |
| `CLIENT_URL` | ✅ (prod) | Allowed CORS origin for the frontend |
| `GMAIL_USER` / `GMAIL_PASS` | ✅ (email) | Gmail SMTP creds (use an App Password) |
| `IMGBB_API_KEY` | optional | Profile picture uploads |
| `STRIPE_SECRET_KEY` | optional | Real billing; mock mode when unset |
| `SENTRY_DSN` | optional | Error tracking; logs-only when unset |
| `LOG_LEVEL` | optional | `debug`/`info`/`warn`/`error` |
| `SELF_PING_URL` | optional | Keep-alive ping for sleeping free-tier hosts |

---

## 🏗️ Project Structure

```
server/
  config/      plans.js — single source of truth for tiers & feature flags
  middleware/  rate limiting
  models/      Mongoose models (user, subscription, transaction, notification)
  resolvers/   GraphQL resolvers (auth checks + validation)
  services/    billing.js (Stripe seam), errorTracking.js (Sentry seam)
  typeDefs/    GraphQL schema
  utils/       logger, validators, exchangeRates (FX), emails, billing helpers
  jobs/        node-cron jobs (billing rollover, reminders, keep-alive)
  tests/       node:test unit tests
client/
  src/         React app (pages, components, contexts, GraphQL operations)
```

---

## 📌 Roadmap / Future Improvements

- Wire Stripe Checkout into the billing seam for real paid upgrades.
- Server-side analytics aggregation for dashboard charts.
- Export subscription data (CSV/PDF) and push notifications.
- Expand the test suite to resolver/integration coverage.
