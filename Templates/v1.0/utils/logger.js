const winston = require("winston");
const path = require("path");

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// ── Custom level styling ──────────────────────────────────────────────
// Gives each level its own color + icon so you can scan logs by eye,
// without reading the text.
const LEVEL_STYLES = {
  error: { icon: "✖", color: "red" },
  warn: { icon: "⚠", color: "yellow" },
  info: { icon: "ℹ", color: "cyan" },
  http: { icon: "→", color: "magenta" },
  verbose: { icon: "…", color: "blue" },
  debug: { icon: "🐛", color: "gray" },
  silly: { icon: "✧", color: "gray" },
};

winston.addColors(
  Object.fromEntries(
    Object.entries(LEVEL_STYLES).map(([lvl, { color }]) => [lvl, color]),
  ),
);

const PAD = Math.max(...Object.keys(LEVEL_STYLES).map((l) => l.length));

const devFormat = combine(
  colorize({
    all: false,
    colors: Object.fromEntries(
      Object.entries(LEVEL_STYLES).map(([l, s]) => [l, s.color]),
    ),
  }),
  timestamp({ format: "HH:mm:ss.SSS" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack, ...meta }) => {
    // colorize() already wrapped `level` in ANSI codes, so strip it to
    // get the plain name for icon/padding lookups.
    const plain = level.replace(/\x1b\[[0-9;]*m/g, "");
    const style = LEVEL_STYLES[plain] || { icon: "•" };
    const label = `${style.icon} ${plain.toUpperCase()}`.padEnd(PAD + 2);

    // Re-colorize just the label so padding stays correct
    const colored = level
      .replace(plain.toUpperCase(), label)
      .replace(plain, label);

    const time = `\x1b[90m${timestamp}\x1b[0m`; // dim gray timestamp
    const extra = Object.keys(meta).length ? `\n  ${JSON.stringify(meta)}` : "";

    if (stack) {
      const divider = "\x1b[90m" + "─".repeat(60) + "\x1b[0m";
      return `${time}  ${colored}  ${message}\n${divider}\n${stack}\n${divider}`;
    }

    return `${time}  ${colored}  ${message}${extra}`;
  }),
);

const prodFormat = combine(timestamp(), errors({ stack: true }), json());

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "http",
  format: process.env.NODE_ENV === "production" ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(__dirname, "..", "logs", "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(__dirname, "..", "logs", "combined.log"),
    }),
  ],
  exitOnError: false,
});

module.exports = logger;
