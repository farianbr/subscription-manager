import http from "http";
import cors from "cors";
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
import User from "./models/user.model.js";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { ApolloServerPluginLandingPageDisabled } from "@apollo/server/plugin/disabled";
import callServer from "./jobs/callServer.js";

dotenv.config();

callServer.start()

scheduleDailyReminders();

configurePassport();

const app = express();
const httpServer = http.createServer(app);

const __dirname = path.resolve();

const MongoDBStore = ConnectMongo(session);

const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

store.on("error", (err) => console.log(err));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
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
    ...(process.env.NODE_ENV === "production"
      ? [ApolloServerPluginLandingPageDisabled()]
      : [ApolloServerPluginLandingPageLocalDefault()]),
  ],
  introspection: process.env.NODE_ENV !== "production", // disable schema introspection in prod
});

await server.start();

app.use(
  "/graphql",
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req, res }) => buildContext({ req, res }),
  })
);

if (process.env.NODE_ENV === "production") {
  app.get("/graphql", (req, res) => {
    res.status(403).send("GraphQL GUI is disabled in production");
  });
}


app.get("/verify-email", async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send("Invalid token");

  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: Date.now() },
  });

  if (!user) return res.status(400).send("Token invalid or expired");

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  res.send("✅ Email verified successfully. You can now log in.");
});

app.use(express.static(path.join(__dirname, "client/dist")));



app.get("*path", (req, res) => {
  res.sendFile(path.join(__dirname, "client/dist", "index.html"));
});

await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
await connectDB();

console.log("Server ready");
