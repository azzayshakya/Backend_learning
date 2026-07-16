const { GoogleGenAI } = require("@google/genai");
const logger = require("../utils/logger");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  logger.error(
    "GEMINI_API_KEY is missing. Set it in your .env file before starting the server.",
  );
  throw new Error(
    "GEMINI_API_KEY is required but was not found in environment variables",
  );
}

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

logger.info("Gemini AI client initialized");

module.exports = ai;
