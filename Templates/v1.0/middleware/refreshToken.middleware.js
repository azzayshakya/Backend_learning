const { verifyRefreshTokenSignature } = require("../utils/tokenVerifier");
const { extractToken } = require("../utils/tokenExtractor");
const tokenService = require("../services/token.service");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const logger = require("../utils/logger");

const verifyRefreshToken = asyncHandler(async (req, res, next) => {
  const token = extractToken(req, {
    cookieKey: "refreshToken",
    bodyKey: "refreshToken",
    headerKey: "x-refresh-token",
  });

  if (!token) {
    throw ApiError.unauthorized("Refresh token missing");
  }

  let decoded;
  try {
    decoded = verifyRefreshTokenSignature(token);
  } catch (err) {
    logger.warn(`Refresh token verification failed: ${err.message}`);
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }

  const deviceId = req.body?.deviceId;
  if (!deviceId) {
    throw ApiError.badRequest("deviceId is required");
  }

  const isValid = await tokenService.isRefreshTokenValid(
    decoded.sub,
    deviceId,
    decoded.jti,
  );

  if (!isValid) {
    // A mismatched or missing jti means this token was already rotated out
    // (or never existed) — treat it as a stolen/replayed token.
    await tokenService.revokeAllSessions(decoded.sub);
    throw ApiError.unauthorized("Session invalid — please log in again");
  }

  req.refreshPayload = { userId: decoded.sub, deviceId };
  next();
});

module.exports = { verifyRefreshToken };
