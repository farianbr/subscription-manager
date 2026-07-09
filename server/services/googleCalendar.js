// Google Calendar sync for Premium users. Hand-rolled over fetch (no SDK) to
// keep deps minimal and consistent with the rest of the app. Scope is limited
// to calendar.events (+ email, to show which account is linked). Refresh tokens
// are stored encrypted (utils/crypto.js) and never leave the server.

import { encrypt, decrypt } from "../utils/crypto.js";
import logger from "../utils/logger.js";

const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const REVOKE_ENDPOINT = "https://oauth2.googleapis.com/revoke";
const USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v2/userinfo";
const CALENDAR_API = "https://www.googleapis.com/calendar/v3/calendars";

const SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/calendar.events",
];

const CYCLE_TO_RRULE = {
  weekly: "RRULE:FREQ=WEEKLY",
  monthly: "RRULE:FREQ=MONTHLY",
  yearly: "RRULE:FREQ=YEARLY",
};

export function isGoogleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function appBaseUrl() {
  return (
    process.env.APP_URL ||
    process.env.CLIENT_URL ||
    `http://localhost:${process.env.PORT || 4000}`
  ).replace(/\/$/, "");
}

export function redirectUri() {
  return process.env.GOOGLE_REDIRECT_URI || `${appBaseUrl()}/auth/google/calendar/callback`;
}

export function buildAuthUrl(state) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri(),
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    include_granted_scopes: "true",
    prompt: "consent", // force a refresh_token every time
    state,
  });
  return `${AUTH_ENDPOINT}?${params.toString()}`;
}

async function tokenRequest(body) {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body).toString(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    logger.error(`Google token error ${res.status}: ${data.error || ""} ${data.error_description || ""}`);
    throw new Error("Google authorization failed.");
  }
  return data;
}

/** Exchange an authorization code for tokens (includes refresh_token). */
export async function exchangeCode(code) {
  return tokenRequest({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: redirectUri(),
    grant_type: "authorization_code",
  });
}

async function refreshAccessToken(refreshToken) {
  const data = await tokenRequest({
    refresh_token: refreshToken,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    grant_type: "refresh_token",
  });
  return { accessToken: data.access_token, expiresIn: data.expires_in || 3600 };
}

export async function fetchAccountEmail(accessToken) {
  try {
    const res = await fetch(USERINFO_ENDPOINT, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.email || null;
  } catch {
    return null;
  }
}

export function encryptRefreshToken(token) {
  return encrypt(token);
}

// Cache access tokens in memory (they last ~1h) to avoid refreshing per event.
const accessCache = new Map(); // userId -> { token, exp }

async function accessTokenFor(user) {
  const key = String(user._id);
  const cached = accessCache.get(key);
  if (cached && cached.exp > Date.now() + 30_000) return cached.token;

  const enc = user.googleCalendar?.refreshToken;
  if (!enc) throw new Error("Google Calendar is not connected.");
  const refreshToken = decrypt(enc);
  const { accessToken, expiresIn } = await refreshAccessToken(refreshToken);
  accessCache.set(key, { token: accessToken, exp: Date.now() + expiresIn * 1000 });
  return accessToken;
}

export function clearAccessCache(userId) {
  accessCache.delete(String(userId));
}

function toDateOnly(date) {
  const d = new Date(date);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function amountLabel(sub) {
  if (sub.originalAmount != null && sub.originalCurrency) {
    return `${sub.originalCurrency} ${sub.originalAmount}`;
  }
  return `$${(sub.costInDollar ?? 0).toFixed(2)}`;
}

function eventBody(sub) {
  const start = new Date(sub.nextBillingDate);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1); // all-day end date is exclusive
  return {
    summary: `${sub.serviceName} renews (${amountLabel(sub)})`,
    description: `${sub.serviceName} · ${sub.provider} · ${sub.billingCycle} billing\nManaged by Subscription Manager`,
    start: { date: toDateOnly(start) },
    end: { date: toDateOnly(end) },
    recurrence: [CYCLE_TO_RRULE[sub.billingCycle] || CYCLE_TO_RRULE.monthly],
    transparency: "transparent",
    reminders: { useDefault: false, overrides: [{ method: "popup", minutes: 24 * 60 }] },
  };
}

async function calendarFetch(user, path, { method = "GET", body } = {}) {
  const token = await accessTokenFor(user);
  const calId = encodeURIComponent(user.googleCalendar?.calendarId || "primary");
  const res = await fetch(`${CALENDAR_API}/${calId}/events${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res;
}

/**
 * Create or update the calendar event for a subscription.
 * @returns {Promise<string|null>} the event id (new or existing), or null on 404-recreate.
 */
export async function upsertEvent(user, sub) {
  if (sub.googleEventId) {
    const res = await calendarFetch(user, `/${encodeURIComponent(sub.googleEventId)}`, {
      method: "PATCH",
      body: eventBody(sub),
    });
    if (res.ok) {
      const data = await res.json();
      return data.id;
    }
    if (res.status !== 404 && res.status !== 410) {
      const t = await res.text().catch(() => "");
      logger.error(`Calendar patch failed ${res.status}: ${t.slice(0, 300)}`);
      throw new Error("Failed to update the calendar event.");
    }
    // 404/410: the event was removed on Google's side — fall through to create.
  }

  const res = await calendarFetch(user, "", { method: "POST", body: eventBody(sub) });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    logger.error(`Calendar create failed ${res.status}: ${t.slice(0, 300)}`);
    throw new Error("Failed to create the calendar event.");
  }
  const data = await res.json();
  return data.id;
}

/** Delete the calendar event for a subscription (idempotent). */
export async function deleteEvent(user, sub) {
  if (!sub.googleEventId) return;
  const res = await calendarFetch(user, `/${encodeURIComponent(sub.googleEventId)}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 404 && res.status !== 410) {
    const t = await res.text().catch(() => "");
    logger.error(`Calendar delete failed ${res.status}: ${t.slice(0, 300)}`);
  }
}

/** Revoke Google access entirely (used on disconnect). Best-effort. */
export async function revokeToken(encryptedRefreshToken) {
  try {
    const token = decrypt(encryptedRefreshToken);
    await fetch(`${REVOKE_ENDPOINT}?token=${encodeURIComponent(token)}`, { method: "POST" });
  } catch (err) {
    logger.error("Google token revoke failed:", err.message);
  }
}
