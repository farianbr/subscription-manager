// Small crypto helpers for the Google Calendar integration:
//  - AES-256-GCM encryption for refresh tokens at rest
//  - HMAC-signed, expiring OAuth `state` tokens (CSRF defense + user binding)
//
// The key is derived from SESSION_SECRET so no extra env is required. If you
// rotate SESSION_SECRET, previously stored refresh tokens become undecryptable
// (users simply reconnect) — acceptable for this low-volume, single-tenant app.

import crypto from "crypto";

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is required for token encryption");
  return s;
}

let cachedKey = null;
function key() {
  if (!cachedKey) {
    // Static salt is fine here: the secret is the entropy source, and this is
    // an app-level key, not a per-password hash.
    cachedKey = crypto.scryptSync(secret(), "submgr.token.v1", 32);
  }
  return cachedKey;
}

/** Encrypt a UTF-8 string → "v1:iv:tag:ciphertext" (all base64). */
export function encrypt(plaintext) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([cipher.update(String(plaintext), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("base64")}:${tag.toString("base64")}:${enc.toString("base64")}`;
}

/** Decrypt a payload produced by encrypt(). Throws on tamper/format errors. */
export function decrypt(payload) {
  const [version, ivB64, tagB64, dataB64] = String(payload).split(":");
  if (version !== "v1") throw new Error("Unsupported ciphertext version");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]).toString("utf8");
}

function b64url(buf) {
  return Buffer.from(buf).toString("base64url");
}

/**
 * Sign an OAuth `state`: base64url(JSON payload) + "." + HMAC. The payload
 * carries the user id and an expiry so the callback can bind the flow to the
 * initiating user without relying on the (sameSite=strict) session cookie.
 */
export function signState(payload, ttlMs = 10 * 60 * 1000) {
  const body = { ...payload, exp: Date.now() + ttlMs, nonce: crypto.randomBytes(8).toString("hex") };
  const encoded = b64url(JSON.stringify(body));
  const mac = crypto.createHmac("sha256", secret()).update(encoded).digest("base64url");
  return `${encoded}.${mac}`;
}

/** Verify + decode a state token. Throws if tampered or expired. */
export function verifyState(token) {
  const [encoded, mac] = String(token).split(".");
  if (!encoded || !mac) throw new Error("Malformed state");
  const expected = crypto.createHmac("sha256", secret()).update(encoded).digest("base64url");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new Error("Invalid state signature");
  }
  const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
  if (!payload.exp || Date.now() > payload.exp) throw new Error("State expired");
  return payload;
}
