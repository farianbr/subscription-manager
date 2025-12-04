# 📊 Subscription Manager

A full-stack **subscription manager** built with **GraphQL, Apollo, MongoDB, React, and TailwindCSS**.  
It helps users keep track of their subscriptions, set alerts, and receive email reminders before renewals.

---

## ✨ Features

- 🔐 **Authentication & Authorization**
  - User signup and auto-login.
  - Secure password hashing with `bcrypt`.
  - Login sessions using Passport.js.

- 📊 **Subscriptions Management**
  - Create, update, delete subscriptions.
  - Track provider, category, amount, payment type, and billing dates.
  - Toggle alerts on/off for each subscription.
  - Multi-currency support (USD, EUR, GBP, INR, BDT, CAD, AUD).

- 🎨 **Frontend (React + TailwindCSS)**
  - Responsive, modern UI.
  - Loading skeletons for smooth UX.
  - Toast notifications for success/error states.
  - Dashboard with subscription history and statistics.

- ⚡ **GraphQL Backend**
  - Apollo Server with Express integration.
  - Modular schema (`typeDefs` + `resolvers`).
  - Queries: fetch users, transactions, statistics.
  - Mutations: signup, login, logout, create/update/delete transaction.

---

## 🛠️ Tech Stack

**Frontend:**
- React (Vite)
- Apollo Client
- React Router
- TailwindCSS
- React Hot Toast

**Backend:**
- Node.js + Express
- Apollo Server (GraphQL)
- Passport.js (authentication)
- Bcrypt (password hashing)
- Node-cron (scheduled tasks)

**Database:**
- MongoDB (via Mongoose)

**Image Storage:**
- ImgBB API (profile picture uploads)

---

## 📌 Future Improvements

- Push notifications for subscription reminders.
- Active vs. Inactive status (based on billing date).
- Export subscription data to CSV/PDF.
- Bulk subscription management.

