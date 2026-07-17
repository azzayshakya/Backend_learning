const mongoSanitize = require("express-mongo-sanitize");
const logger = require("../utils/logger");

/**
 * Strips out any request keys containing "$" or "." — these are how
 * NoSQL injection attacks work against Mongoose (e.g. sending
 * { "email": { "$gt": "" } } to bypass a login check).
 */
const sanitizeMongo = mongoSanitize({
  replaceWith: "_",
  onSanitize: ({ req, key }) => {
    logger.warn(
      `Blocked potential NoSQL injection key "${key}" on ${req.originalUrl}`,
    );
  },
});

/**
 * Lightweight recursive HTML-tag stripper for XSS protection on chat
 * messages/usernames/group names (xss-clean is deprecated/unmaintained,
 * so this is a minimal hand-rolled version — swap for a library like
 * `sanitize-html` if you need to allow some safe HTML formatting).
 */
const stripTags = (value) => {
  if (typeof value === "string") {
    return value.replace(/<[^>]*>?/gm, "").trim();
  }
  if (Array.isArray(value)) return value.map(stripTags);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, stripTags(v)]),
    );
  }
  return value;
};

const sanitizeXSS = (req, res, next) => {
  if (req.body) req.body = stripTags(req.body);
  if (req.query) req.query = stripTags(req.query);
  if (req.params) req.params = stripTags(req.params);
  next();
};

module.exports = { sanitizeMongo, sanitizeXSS };
