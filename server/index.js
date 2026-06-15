import http from "http";
import cors from "cors";
import helmet from "helmet";
import express from "express";
import dotenv from "dotenv";
import path from "path";

import ConnectMongo from "connect-mongodb-session";
import session from "express-session";
import passport from "passport";
import { buildContext } from "graphql-passport";

import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@as-integrations/express5";

import mergedResolvers from "./resolvers/index.js";
import mergedTypeDefs from "./typeDefs/index.js";
import { connectDB } from "./db/connectDB.js";
import { configurePassport } from "./passport/passport.config.js";
import { scheduleDailyReminders } from "./jobs/reminderJob.js";
import { startBillingCycleJob } from "./jobs/billingCycleJob.js";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { ApolloServerPluginLandingPageDisabled } from "@apollo/server/plugin/disabled";
import callServer from "./jobs/callServer.js";
import { graphqlLimiter, authRateLimiter } from "./middleware/rateLimit.js";
import logger from "./utils/logger.js";
import { initErrorTracking, captureException } from "./services/errorTracking.js";

dotenv.config();

const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

initErrorTracking();

// Never let an unhandled async error take the process down silently.
process.on("unhandledRejection", (reason) => {
  captureException(reason, { kind: "unhandledRejection" });
});
process.on("uncaughtException", (err) => {
  captureException(err, { kind: "uncaughtException" });
});

callServer.start();

scheduleDailyReminders();
startBillingCycleJob();

configurePassport();

const app = express();
const httpServer = http.createServer(app);

const isProduction = process.env.NODE_ENV === "production";

// Behind a proxy (Render/Heroku/etc.) so secure cookies work over forwarded HTTPS
if (isProduction) app.set("trust proxy", 1);

// Security headers. CSP is disabled for now since the SPA + Apollo sandbox
// need a tailored policy — tracked as a follow-up in the hardening roadmap.
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

const __dirname = path.resolve();

const MongoDBStore = ConnectMongo(session);

const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

store.on("error", (err) => logger.error("Session store error:", err));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      secure: isProduction, // HTTPS-only in production
      sameSite: isProduction ? "strict" : "lax",
    },
    store: store,
  })
);

app.use(passport.initialize());
app.use(passport.session());

const server = new ApolloServer({
  typeDefs: mergedTypeDefs,
  resolvers: mergedResolvers,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    ...(isProduction
      ? [ApolloServerPluginLandingPageDisabled()]
      : [ApolloServerPluginLandingPageLocalDefault()]),
  ],
  introspection: !isProduction, // disable schema introspection in prod
  // Central place to shape outgoing GraphQL errors. Resolvers already log with
  // context, and Apollo strips stack traces in production, so user-facing
  // messages (e.g. "Invalid credentials") still reach the client unchanged.
  // When a provider is wired in services/errorTracking.js, forward unexpected
  // errors here, e.g. captureException(error, { code, path }).
  formatError: (formattedError) => {
    if (isProduction && formattedError.extensions) {
      // Defense in depth: never leak internals even if something slips through.
      delete formattedError.extensions.stacktrace;
    }
    return formattedError;
  },
});

await server.start();

app.use(
  "/graphql",
  cors({
    origin: CLIENT_URL,
    credentials: true,
  }),
  graphqlLimiter,
  express.json(),
  authRateLimiter,
  expressMiddleware(server, {
    context: async ({ req, res }) => buildContext({ req, res }),
  })
);

if (isProduction) {
  app.get("/graphql", (req, res) => {
    res.status(403).send("GraphQL GUI is disabled in production");
  });
}


app.use(express.static(path.join(__dirname, "client/dist")));



app.get("*path", (req, res) => {
  res.sendFile(path.join(__dirname, "client/dist", "index.html"));
});

await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
await connectDB();

logger.info(`Server ready on port ${PORT}`, { env: process.env.NODE_ENV || "development" });
