const redisClient = require("../services/redis.client");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

const checkUserBlockedStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.user;
  const isBlocked = await redisClient.get(`blocked_user:${id}`);

  if (isBlocked) {
    throw ApiError.forbidden("Your account has been blocked");
  }

  next();
});

module.exports = checkUserBlockedStatus;
