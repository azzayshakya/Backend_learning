require("dotenv").config();

module.exports = {
  accessToken: {
    secret: process.env.JWT_ACCESS_SECRET,
    expiresIn: process.env.JWT_ACCESS_EXPIRY || "50m", // short-lived by design
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_REFRESH_EXPIRY || "30d",
    // Redis TTL needs milliseconds, not a "30d" string — kept in sync manually.
    expiresInMs: 30 * 24 * 60 * 60 * 1000,
  },
  issuer: process.env.JWT_ISSUER || "your-app-name",
};
