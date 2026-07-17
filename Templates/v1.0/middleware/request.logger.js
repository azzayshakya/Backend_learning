const morgan = require("morgan");
const logger = require("../utils/logger");

const stream = {
  write: (message) => logger.http(message.trim()),
};

const skip = (req) =>
  req.originalUrl === "/health" || req.originalUrl === "/favicon.ico";

const requestLogger = morgan(
  process.env.NODE_ENV === "production"
    ? "combined"
    : ":method :url :status :response-time ms - :res[content-length]",
  { stream, skip },
);

module.exports = requestLogger;
