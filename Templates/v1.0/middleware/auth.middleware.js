const {
  verifyAccessToken,
  verifyRefreshTokenSignature,
} = require("../utils/generateTokens");
const redisClient = require("../utils/redisClient");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// Pulls the access token from "Authorization: Bearer xxx" header first,
// falls back to a cookie if you choose to store it that way.
function extractAccessToken(req) {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) return header.split(" ")[1];
  if (req.cookies?.accessToken) return req.cookies.accessToken;
  return null;
}

// Verifies the access token's signature/expiry and attaches the decoded
// payload to req.user. Deliberately does NOT check blacklist/block status —
// those are separate middlewares (blacklist.middleware, blockCheck.middleware)
// so each concern stays isolated, testable, and reorderable.
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

// Validates the refresh token sent via HttpOnly cookie:
//   1. Check JWT signature/expiry
//   2. Confirm its jti matches what's stored in Redis for that user+device
// If the stored jti doesn't match, this token was already rotated/revoked —
// someone is replaying an old token. Treat as theft: kill ALL sessions
// for that user as a safety measure, not just this one.
const verifyRefreshToken = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw ApiError.unauthorized("Refresh token missing");

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
