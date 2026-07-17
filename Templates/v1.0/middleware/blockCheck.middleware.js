const redisClient = require("../utils/redisClient");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// Must run AFTER authenticateAccessToken (needs req.user.id).
// Even with a valid, non-blacklisted token, an admin can block a user
// mid-session. This catches that on the very next request instead of
// waiting for the access token to naturally expire (10-15 min window).
const checkUserBlockedStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.user;
  const isBlocked = await redisClient.get(`blocked_user:${id}`);

  if (isBlocked) {
    throw ApiError.forbidden("Your account has been blocked");
  }

  next();
});

module.exports = checkUserBlockedStatus;
