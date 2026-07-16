const { createClient } = require("redis");
const logger = require("./logger");

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) =>
  logger.error(`Redis client error: ${err.message}`),
);
redisClient.on("connect", () => logger.info("Redis connected"));
redisClient.on("reconnecting", () => logger.warn("Redis reconnecting..."));

// Connect once at boot. Import this file AFTER dotenv is loaded.
(async () => {
  try {
    if (!redisClient.isOpen) await redisClient.connect();
  } catch (err) {
    logger.error(`Redis initial connection failed: ${err.message}`);
    // Deliberately not throwing — app should still boot and serve requests
    // even if caching is temporarily unavailable (see graceful fallbacks below).
  }
})();

/**
 * Every method here swallows its own errors and returns a safe fallback
 * (null / false) instead of throwing. A cache outage should degrade
 * performance, never take down the API.
 */
const cache = {
  async get(key) {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (err) {
      logger.error(`Cache GET failed [${key}]: ${err.message}`);
      return null;
    }
  },

  async set(key, value, ttlSeconds = 3600) {
    try {
      await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
      return true;
    } catch (err) {
      logger.error(`Cache SET failed [${key}]: ${err.message}`);
      return false;
    }
  },

  async del(key) {
    try {
      await redisClient.del(key);
      return true;
    } catch (err) {
      logger.error(`Cache DEL failed [${key}]: ${err.message}`);
      return false;
    }
  },

  // e.g. cache.invalidatePattern("group:123:*") after a group update
  async invalidatePattern(pattern) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length) await redisClient.del(keys);
      return true;
    } catch (err) {
      logger.error(
        `Cache pattern invalidation failed [${pattern}]: ${err.message}`,
      );
      return false;
    }
  },
};

module.exports = { redisClient, cache };
