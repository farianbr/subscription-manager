import { test } from "node:test";
import assert from "node:assert/strict";

// crypto.js derives its key from SESSION_SECRET; ensure one is present.
process.env.SESSION_SECRET = process.env.SESSION_SECRET || "test-session-secret";

const { encrypt, decrypt, signState, verifyState } = await import("../utils/crypto.js");

test("encrypt/decrypt round-trips a refresh token", () => {
  const secret = "1//0abcRefreshTokenExample-_.value";
  const enc = encrypt(secret);
  assert.notEqual(enc, secret);
  assert.match(enc, /^v1:/);
  assert.equal(decrypt(enc), secret);
});

test("decrypt rejects a tampered ciphertext", () => {
  const enc = encrypt("hello");
  const parts = enc.split(":");
  // Flip a character in the ciphertext segment.
  parts[3] = parts[3].slice(0, -1) + (parts[3].slice(-1) === "A" ? "B" : "A");
  assert.throws(() => decrypt(parts.join(":")));
});

test("signState/verifyState round-trips the payload", () => {
  const token = signState({ uid: "user-123" });
  const payload = verifyState(token);
  assert.equal(payload.uid, "user-123");
  assert.ok(payload.exp > Date.now());
});

test("verifyState rejects a tampered signature", () => {
  const token = signState({ uid: "user-123" });
  const [body] = token.split(".");
  assert.throws(() => verifyState(`${body}.deadbeef`), /Invalid state signature/);
});

test("verifyState rejects an expired token", () => {
  const token = signState({ uid: "user-123" }, -1000); // already expired
  assert.throws(() => verifyState(token), /expired/);
});
