const redisClient = require("./redis.client");
const {
  refreshTokenKey,
  refreshTokenPattern,
  blacklistedAccessTokenKey,
  blockedUserKey,
} = require("../utils/redisKeys");
const logger = require("../utils/logger");
const jwtConfig = require("../config/jwt.config");

async function storeRefreshTokenForRedis(userId, deviceId, jti) {
  await redisClient.set(
    refreshTokenKey(userId, deviceId),
    jti,
    "PX",
    jwtConfig.refreshToken.expiresInMs,
  );
}

async function isRefreshTokenValid(userId, deviceId, jti) {
  const storedJti = await redisClient.get(refreshTokenKey(userId, deviceId));
  return Boolean(storedJti) && storedJti === jti;
}

async function revokeSession(userId, deviceId) {
  const deleted = await redisClient.del(refreshTokenKey(userId, deviceId));
  return deleted > 0;
}

async function revokeAllSessions(userId) {
  const keys = await redisClient.keys(refreshTokenPattern(userId));
  if (keys.length > 0) {
    await redisClient.del(...keys);
  }
  return keys.length;
}

async function blacklistAccessToken(jti, ttlSeconds) {
  if (ttlSeconds <= 0) return; // already expired — nothing to blacklist
  await redisClient.set(blacklistedAccessTokenKey(jti), "1", "EX", ttlSeconds);
}

async function blockUserAndRevokeSessions(userId) {
  await redisClient.set(blockedUserKey(userId), "1");
  const revokedCount = await revokeAllSessions(userId);
  logger.warn(`User ${userId} blocked — ${revokedCount} session(s) revoked`);
}

async function isUserBlocked(userId) {
  return Boolean(await redisClient.get(blockedUserKey(userId)));
}

module.exports = {
  storeRefreshTokenForRedis,
  isRefreshTokenValid,
  revokeSession,
  revokeAllSessions,
  blacklistAccessToken,
  blockUserAndRevokeSessions,
  isUserBlocked,
};
