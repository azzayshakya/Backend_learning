const ai = require("../config/gemini.config");
const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";

const generateText = async (prompt, options = {}) => {
  const model = options.model || DEFAULT_MODEL;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    const text = response?.text;

    if (!text) {
      logger.error("Gemini returned an empty response");
      throw ApiError.internal("AI model returned an empty response");
    }

    return text;
  } catch (err) {
    if (err.isOperational) throw err;

    logger.error(`Gemini API call failed: ${err.message}`);
    throw ApiError.internal("Failed to generate content from AI model");
  }
};

module.exports = {
  generateText,
};
