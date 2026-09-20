const adminSession = require("../lib/adminSession");

module.exports = function requireAdminAuth(req, res, next) {
  if (adminSession.isValid(req)) {
    return next();
  }
  return res.status(401).json({ error: "Not authenticated" });
};
