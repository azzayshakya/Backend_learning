require("dotenv").config();

module.exports = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,

  // Exponential backoff capped at 5s — a Redis restart won't crash the app,
  // commands just queue and retry until the connection comes back.
  retryStrategy: (times) => Math.min(times * 200, 5000),
  maxRetriesPerRequest: 3,
};
