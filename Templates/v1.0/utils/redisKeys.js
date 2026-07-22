const refreshTokenKey = (userId, deviceId) =>
  `refresh_token:${userId}:${deviceId}`;

const refreshTokenPattern = (userId) => `refresh_token:${userId}:*`;

const blacklistedAccessTokenKey = (jti) => `blacklist:${jti}`;

const blockedUserKey = (userId) => `blocked_user:${userId}`;

module.exports = {
  refreshTokenKey,
  refreshTokenPattern,
  blacklistedAccessTokenKey,
  blockedUserKey,
};
