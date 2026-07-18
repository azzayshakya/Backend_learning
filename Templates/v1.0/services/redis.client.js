const Redis = require("ioredis");
const redisOptions = require("../config/redis.config");
const logger = require("../utils/logger");

const redisUrl = process.env.UPSTASH_REDIS_URL;
console.log(redisUrl);
if (!redisUrl) {
  logger.error("UPSTASH_REDIS_URL is missing from environment variables");
}

const redisClient = new Redis(redisUrl, redisOptions);

redisClient.on("connect", () => logger.info("Redis connected"));
redisClient.on("ready", () => logger.info("Redis ready to accept commands"));
redisClient.on("error", (err) =>
  logger.error(`Redis error: ${err.message || err}`),
);

module.exports = redisClient;
