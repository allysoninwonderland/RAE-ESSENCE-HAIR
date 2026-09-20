const path = require("node:path");
const fs = require("node:fs");
const { createClient } = require("@libsql/client");
const env = require("../config/env");

let url = env.tursoDatabaseUrl;

if (url.startsWith("file:")) {
  const dataDir = path.join(__dirname, "..", "..", "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

const db = createClient({
  url,
  authToken: env.tursoAuthToken,
});

module.exports = db;
