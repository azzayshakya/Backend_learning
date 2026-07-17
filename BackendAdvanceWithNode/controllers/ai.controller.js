const aiService = require("../services/ai.service");
const logger = require("../utils/logger");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

const generateText = async (req, res, next) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      throw ApiError.badRequest(
        "Prompt is required and must be a non-empty string",
      );
    }

    logger.info(
      `Generating AI response for prompt: "${prompt.slice(0, 60)}..."`,
    );

    const result = await aiService.generateText(prompt);

    logger.info("AI response generated successfully");

    res
      .status(200)
      .json(
        ApiResponse(
          200,
          { prompt, response: result },
          "AI response generated successfully",
        ),
      );
  } catch (err) {
    logger.error(err);
    next(err);
  }
};

module.exports = {
  generateText,
};
