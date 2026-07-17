const Redis = require("ioredis");
const redisConfig = require("../config/redis.config");
const logger = require("../utils/logger");

// Single shared Redis connection for the whole app — used for refresh
// token storage, access-token blacklist, blocked-user flags, and rate limiting.
const redisClient = new Redis(redisConfig);

redisClient.on("connect", () => logger.info("Redis connected"));
redisClient.on("error", (err) => logger.error(`Redis error: ${err.message}`));

module.exports = redisClient;
