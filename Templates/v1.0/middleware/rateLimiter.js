const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");
const { redisClient } = require("../utils/cache");
const ApiError = require("../utils/apiError");

/**
 * Builds a rate limiter backed by Redis so limits are shared correctly
 * across multiple Node instances (PM2 cluster mode / multiple servers).
 * Falls back to the in-memory store automatically if Redis isn't connected
 * yet — limiting still works, it just won't be shared across instances
 * until Redis reconnects.
 */
const buildLimiter = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    store: redisClient?.isOpen
      ? new RedisStore({
          sendCommand: (...args) => redisClient.sendCommand(args),
          prefix: "rl:",
        })
      : undefined,
    handler: (req, res, next) => {
      next(
        new ApiError(
          429,
          message || "Too many requests, please try again later",
        ),
      );
    },
  });

// General API traffic (reads, misc endpoints)
const apiLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  message: "Too many requests from this IP, try again in 15 minutes",
});

// Auth routes — strict, protects against brute force / credential stuffing
const authLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts, try again in 15 minutes",
});

// REST-based message sending (e.g. file upload endpoint, not the socket path)
const messageLimiter = buildLimiter({
  windowMs: 60 * 1000, // 1 min
  max: 30,
  message: "You're sending messages too fast, slow down",
});

module.exports = { apiLimiter, authLimiter, messageLimiter };
