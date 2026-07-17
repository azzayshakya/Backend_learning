const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");
const jwtConfig = require("../config/jwt.config");
const redisClient = require("./redisClient");
const logger = require("./logger");

// ── Access Token ─────────────────────────────────────────────────────
// Short-lived, stateless. Carries only what's needed to identify + authorize
// the user (id, role). Includes a unique "jti" so a single token can be
// blacklisted on logout even though JWTs normally can't be revoked early.
function signAccessToken(user) {
  const jti = randomUUID();
  const token = jwt.sign(
    { sub: user._id.toString(), role: user.role, jti },
    jwtConfig.accessToken.secret,
    { expiresIn: jwtConfig.accessToken.expiresIn, issuer: jwtConfig.issuer },
  );
  return { token, jti };
}

// ── Refresh Token ────────────────────────────────────────────────────
// Long-lived. Its jti gets stored in Redis (keyed by user + device) so we
// can validate, rotate, and revoke it independently of the JWT signature.
function signRefreshToken(user) {
  const jti = randomUUID();
  const token = jwt.sign(
    { sub: user._id.toString(), jti },
    jwtConfig.refreshToken.secret,
    { expiresIn: jwtConfig.refreshToken.expiresIn, issuer: jwtConfig.issuer },
  );
  return { token, jti };
}

// Issues a fresh access + refresh pair and stores the refresh token's jti
// in Redis so it can be looked up, rotated, or revoked per device/session.
// deviceId lets one user have multiple independent sessions (phone, laptop).
async function generateTokenPair(user, deviceId = "default") {
  const access = signAccessToken(user);
  const refresh = signRefreshToken(user);

  const redisKey = `refresh_token:${user._id}:${deviceId}`;
  await redisClient.set(
    redisKey,
    refresh.jti,
    "PX", // TTL in milliseconds
    jwtConfig.refreshToken.expiresInMs,
  );

  logger.info(`Issued token pair for user ${user._id} (device: ${deviceId})`);

  return { accessToken: access.token, refreshToken: refresh.token, deviceId };
}

// Signature/expiry check only — no Redis lookup here. Middleware layers
// the Redis/blacklist/block checks on top separately (single responsibility).
function verifyAccessToken(token) {
  return jwt.verify(token, jwtConfig.accessToken.secret);
}

function verifyRefreshTokenSignature(token) {
  return jwt.verify(token, jwtConfig.refreshToken.secret);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshTokenSignature,
};
