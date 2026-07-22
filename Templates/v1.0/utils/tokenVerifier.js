const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt.config");

function verifyAccessToken(token) {
  return jwt.verify(token, jwtConfig.accessToken.secret);
}

function verifyRefreshTokenSignature(token) {
  return jwt.verify(token, jwtConfig.refreshToken.secret);
}

module.exports = {
  verifyAccessToken,
  verifyRefreshTokenSignature,
};
