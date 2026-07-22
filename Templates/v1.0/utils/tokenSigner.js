const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");
const jwtConfig = require("../config/jwt.config");
const tokenService = require("../services/token.service");
const logger = require("./logger");

function signAccessToken(user) {
  const jti = randomUUID();

  const payload = {
    sub: user._id.toString(),
    role: user.role,
    username: user.username,
    name: user.name,
    jti,
  };

  const token = jwt.sign(payload, jwtConfig.accessToken.secret, {
    expiresIn: jwtConfig.accessToken.expiresIn,
    issuer: jwtConfig.issuer,
  });

  return { token, jti };
}

function signRefreshToken(user) {
  const jti = randomUUID();

  const token = jwt.sign(
    { sub: user._id.toString(), jti },
    jwtConfig.refreshToken.secret,
    { expiresIn: jwtConfig.refreshToken.expiresIn, issuer: jwtConfig.issuer },
  );

  return { token, jti };
}

async function generateTokenPair(user, deviceId) {
  const access = signAccessToken(user);
  const refresh = signRefreshToken(user);

  await tokenService.storeRefreshTokenForRedis(
    user._id.toString(),
    deviceId,
    refresh.jti,
  );

  logger.info(`Issued token pair for user ${user._id} (device: ${deviceId})`);

  return {
    accessToken: access.token,
    refreshToken: refresh.token,
    deviceId,
  };
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  generateTokenPair,
};
