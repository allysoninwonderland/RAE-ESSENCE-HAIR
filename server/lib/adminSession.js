// Stateless admin auth: instead of a server-side session store (which won't
// survive across separate serverless function instances on hosts like
// Vercel), the login state is a signed, expiring cookie value the server can
// verify on every request without needing to remember anything itself.

const crypto = require("node:crypto");
const cookie = require("cookie");
const env = require("../config/env");

const COOKIE_NAME = "rae_admin_session";
const MAX_AGE_SECONDS = 8 * 60 * 60; // 8 hours

function sign(expiresAt) {
  const hmac = crypto.createHmac("sha256", env.sessionSecret).update(String(expiresAt)).digest("hex");
  return `${expiresAt}.${hmac}`;
}

function createCookie() {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000;
  const value = sign(expiresAt);
  return cookie.serialize(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

function clearCookie() {
  return cookie.serialize(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

function isValid(req) {
  const header = req.headers.cookie;
  if (!header) return false;

  const value = cookie.parse(header)[COOKIE_NAME];
  if (!value) return false;

  const [expiresAt, hmac] = value.split(".");
  if (!expiresAt || !hmac) return false;
  if (Number(expiresAt) < Date.now()) return false;

  const expected = sign(expiresAt);
  const expectedHmac = expected.split(".")[1];

  const a = Buffer.from(hmac);
  const b = Buffer.from(expectedHmac);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

module.exports = { createCookie, clearCookie, isValid };
