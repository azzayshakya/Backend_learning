const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");
const redisClient = require("../services/redis.client");
const ApiError = require("../utils/apiError");
const logger = require("../utils/logger");

const buildLimiter = ({ windowMs, max, message, prefix, keyGenerator }) => {
  const redisReady = redisClient.status === "ready";

  if (!redisReady) {
    logger.warn(
      `Rate limiter "${prefix}" falling back to in-memory store (Redis not ready)`,
    );
  }

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    store: redisReady
      ? new RedisStore({
          sendCommand: (...args) => redisClient.call(...args), // ioredis API
          prefix: `ratelimit:${prefix}:`,
        })
      : undefined,
    keyGenerator, // optional override, defaults to req.ip if omitted
    // Routes through the SAME error pipeline as the rest of the app —
    // consistent shape, gets logged, no bypass of errorHandler.middleware.js
    handler: (req, res, next) => {
      next(
        ApiError.tooMany(
          message || "Too many requests, please try again later",
        ),
      );
    },
  });
};

// General API traffic — reads, misc endpoints
const apiLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  prefix: "global",
  message: "Too many requests from this IP, try again in 15 minutes",
});

// Auth routes — strict, and keyed by IP+email so one attacker targeting
// a single account can't also lock out unrelated users on a shared IP
// (office NAT, campus WiFi, VPN exit nodes).
const authLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  prefix: "auth",
  message: "Too many login attempts, try again in 15 minutes",
  keyGenerator: (req) => `${req.ip}:${req.body?.email || "unknown"}`,
});

module.exports = { apiLimiter, authLimiter, buildLimiter };
