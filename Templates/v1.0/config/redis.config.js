require("dotenv").config();

// Only non-URL options live here — retryStrategy, timeouts, etc.
// The connection string itself is passed separately as ioredis's
// first constructor argument (see utils/redisClient.js) because
// ioredis only auto-detects TLS (rediss://) when the URL is a
// plain string, not a field buried inside an options object.
module.exports = {
  retryStrategy: (times) => Math.min(times * 200, 5000),
  maxRetriesPerRequest: 3,
};
