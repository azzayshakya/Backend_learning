const express = require("express");
const cookieParser = require("cookie-parser");
const requestLogger = require("./middlewares/requestLogger");
const { sanitizeMongo, sanitizeXSS } = require("./middlewares/sanitize");
const { apiLimiter } = require("./middlewares/rateLimiter");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

app.use(requestLogger); // log every request
app.use(sanitizeMongo); // block NoSQL injection
app.use(sanitizeXSS); // strip HTML from input
app.use("/api", apiLimiter); // rate-limit all /api routes

// --- your feature routes go here ---
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/messages", require("./routes/message.routes"));
app.use("/api/groups", require("./routes/group.routes"));

app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

// errorHandler MUST be the LAST app.use() call
app.use(errorHandler);

module.exports = app;
