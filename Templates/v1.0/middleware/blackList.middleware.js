const redisClient = require("../services/redis.client");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

// Must run AFTER authenticateAccessToken (needs req.user.jti).
// Checks whether THIS specific token was blacklisted — e.g. by /logout —
// before its natural expiry. This is what makes logout actually work for
// stateless JWTs, which otherwise stay valid until they expire on their own.
const checkTokenBlacklist = asyncHandler(async (req, res, next) => {
  const { jti } = req.user;
  const isBlacklisted = await redisClient.get(`blacklist:${jti}`);

  if (isBlacklisted) {
    throw ApiError.unauthorized("Token has been revoked, please log in again");
  }

  next();
});

module.exports = checkTokenBlacklist;
