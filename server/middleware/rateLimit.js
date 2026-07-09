import rateLimit from "express-rate-limit";

// General limiter for all GraphQL traffic — generous, just a backstop against abuse.
export const graphqlLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please slow down." },
});

// Strict limiter for sensitive auth operations (login, signup, password flows).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again later." },
});

// For unauthenticated/redirect endpoints outside GraphQL: the token-based .ics
// feed and the Google OAuth routes. Defense-in-depth against scraping/abuse.
export const publicRouteLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests, please slow down.",
});

// Sensitive GraphQL operations identified by name or by field appearing in the query body.
const SENSITIVE_OPERATIONS = ["Login", "SignUp", "ForgotPassword", "ResetPassword"];
const SENSITIVE_FIELDS = ["login", "signUp", "forgotPassword", "resetPassword"];

function isSensitiveRequest(req) {
  const body = req.body || {};
  if (SENSITIVE_OPERATIONS.includes(body.operationName)) return true;
  if (typeof body.query === "string") {
    return SENSITIVE_FIELDS.some((field) =>
      new RegExp(`\\b${field}\\s*\\(`).test(body.query)
    );
  }
  return false;
}

// Applies the strict auth limiter only to sensitive operations; everything else passes through.
export function authRateLimiter(req, res, next) {
  if (isSensitiveRequest(req)) return authLimiter(req, res, next);
  return next();
}
