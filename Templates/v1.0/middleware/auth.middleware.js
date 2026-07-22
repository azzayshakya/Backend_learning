const { verifyAccessToken } = require("../utils/tokenVerifier");
const { extractToken } = require("../utils/tokenExtractor");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const logger = require("../utils/logger");

const authenticateAccessToken = asyncHandler(async (req, res, next) => {
  const token = extractToken(req, {
    allowBearer: true,
    cookieKey: "accessToken",
  });

  if (!token) {
    throw ApiError.unauthorized("Access token missing");
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.sub, role: decoded.role, jti: decoded.jti };
    return next();
  } catch (err) {
    logger.warn(`Access token verification failed: ${err.message}`);
    throw ApiError.unauthorized("Invalid or expired access token");
  }
});

module.exports = { authenticateAccessToken };
