const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

const required = ["SESSION_SECRET", "ADMIN_USERNAME", "ADMIN_PASSWORD_HASH"];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}. Copy .env.example to .env and fill it in.`);
  }
}

module.exports = {
  port: Number(process.env.PORT) || 3000,
  publicBaseUrl: process.env.PUBLIC_BASE_URL || "http://localhost:3000",
  sessionSecret: process.env.SESSION_SECRET,
  adminUsername: process.env.ADMIN_USERNAME,
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH,
  // Defaults to a local SQLite file for development. In production, point
  // these at a hosted Turso database (libsql://...) so data survives restarts
  // on hosts without a persistent disk.
  tursoDatabaseUrl: process.env.TURSO_DATABASE_URL || "file:./data/rae-essence-luxe.db",
  tursoAuthToken: process.env.TURSO_AUTH_TOKEN,
};
