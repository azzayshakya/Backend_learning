const {
  verifyAccessToken,
  verifyRefreshTokenSignature,
} = require("../utils/generateTokens");
const redisClient = require("../services/redis.client");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

function extractAccessToken(req) {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) return header.split(" ")[1];
  if (req.cookies?.accessToken) return req.cookies.accessToken;
  return null;
}

const authenticateAccessToken = asyncHandler(async (req, res, next) => {
  const token = extractAccessToken(req);
  if (!token) throw ApiError.unauthorized("Access token missing");

  try {
    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.sub, role: decoded.role, jti: decoded.jti };
    next();
  } catch (err) {
    throw ApiError.unauthorized("Invalid or expired access token");
  }
});

const verifyRefreshToken = asyncHandler(async (req, res, next) => {
  const token = req.headers["refresh-token"];

  if (!token) {
    throw ApiError.unauthorized("Refresh token missing");
  }
  let decoded;
  try {
    decoded = verifyRefreshTokenSignature(token);
  } catch (err) {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }

  const deviceId = req.cookies?.deviceId || "default";
  const redisKey = `refresh_token:${decoded.sub}:${deviceId}`;
  const storedJti = await redisClient.get(redisKey);

  if (!storedJti || storedJti !== decoded.jti) {
    // Reuse of a stale token detected — nuke every session for this user.
    const keys = await redisClient.keys(`refresh_token:${decoded.sub}:*`);
    if (keys.length) await redisClient.del(...keys);
    throw ApiError.unauthorized("Session invalid — please log in again");
  }

  req.refreshPayload = { userId: decoded.sub, deviceId };
  next();
});

module.exports = { authenticateAccessToken, verifyRefreshToken };
