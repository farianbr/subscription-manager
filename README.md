# 📊 Subscription Manager

A full-stack **subscription manager** built with **GraphQL, Apollo, MongoDB, React, and TailwindCSS**.  
It helps users keep track of their subscriptions, set alerts, and receive email reminders before renewals.

---

## ✨ Features

- 🔐 **Authentication & Authorization**
  - User signup with email verification (via SendGrid SMTP).
  - Secure password hashing with `bcrypt`.
  - Login sessions using Passport.js.

- 📬 **Email Notifications**
  - Verification email during signup.
  - Subscription renewal alerts (1 day before end date).
  - Background jobs scheduled using `node-cron`.

- 📊 **Subscriptions Management**
  - Create, update, delete subscriptions.
  - Track provider, category, amount, payment type, and end date.
  - Toggle alerts on/off for each subscription.

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
- Nodemailer + SendGrid SMTP (emails)
- Node-cron (scheduled tasks)

**Database:**
- MongoDB (via Mongoose)

---

## 📌 Future Improvements

- Active vs. Inactive status (based on end date).
- Allow users to change reminder frequency.

