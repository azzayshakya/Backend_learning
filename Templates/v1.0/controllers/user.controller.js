const jwt = require("jsonwebtoken");

const User = require("../models/user.model"); // adjust path/fields to match your actual model
const redisClient = require("../services/redis.client");
const {
  generateTokenPair,
  verifyAccessToken,
} = require("../utils/generateTokens");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const logger = require("../utils/logger");
const generateUniqueUsername = require("../utils/generateUniqueUsername");

// ── Cookie options ──────────────────────────────────────────────────
// httpOnly: JS on the page can't read it (blocks XSS token theft)
// secure: only sent over HTTPS (disabled in dev since localhost is http)
// sameSite: "strict" blocks the cookie being sent on cross-site requests (CSRF)
const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days, matches jwt.config refresh expiry
  path: "/", // scope the cookie to auth routes only
};

const deviceCookieOptions = {
  ...refreshCookieOptions,
  httpOnly: false, // client may need to read/generate this to label sessions
};

// Sends token pair to the client: refresh token as HttpOnly cookie,
// access token in the JSON body (kept in memory client-side, never localStorage).
function sendTokens(res, { accessToken, refreshToken, deviceId }) {
  res.cookie("refreshToken", refreshToken, refreshCookieOptions);
  res.cookie("deviceId", deviceId, deviceCookieOptions);
  return { accessToken, refreshToken };
}

// Strips sensitive fields before sending user data back to the client.
function toSafeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    username: user.username,
  };
}

// ── POST /signup ─────────────────────────────────────────────────────
const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body; // already validated by validateRequest

  const existingUser = await User.findOne({ email });
  if (existingUser)
    throw ApiError.conflict("An account with this email already exists");
  const username = await generateUniqueUsername();
  // Password is hashed automatically by the pre("save") hook in user.model.js
  const user = await User.create({
    name,
    email,
    password,
    username,
    role: "user",
  });

  const deviceId = req.body.deviceId || `device_${Date.now()}`;
  const tokens = await generateTokenPair(user, deviceId);
  const { accessToken, refreshToken } = sendTokens(res, tokens);

  logger.info(`New signup: ${user.email}`);
  return res
    .status(201)
    .json(
      ApiResponse(
        201,
        { user: toSafeUser(user), deviceId, accessToken, refreshToken },
        "Account created successfully",
      ),
    );
});

// ── POST /login ───────────────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { email, password, deviceId } = req.body;

  // password field has `select: false` in the schema — must opt in explicitly
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw ApiError.unauthorized("Invalid email or password");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw ApiError.unauthorized("Invalid email or password");

  // Redundant safety check — checkUserBlockedStatus only runs on already-authenticated
  // routes, so a blocked user without a token yet would otherwise slip through login.
  const isBlocked = await redisClient.get(`blocked_user:${user._id}`);
  if (isBlocked || user.isBlocked)
    throw ApiError.forbidden("Your account has been blocked");

  const finalDeviceId = deviceId || `device_${Date.now()}`;
  const tokens = await generateTokenPair(user, finalDeviceId);
  const { accessToken, refreshToken } = sendTokens(res, tokens);

  logger.info(`Login: ${user.email} (device: ${finalDeviceId})`);
  return res.status(200).json(
    ApiResponse(
      200,
      {
        user: toSafeUser(user),
        accessToken,
        refreshToken,
        deviceId: finalDeviceId,
      },
      "Logged in successfully",
    ),
  );
});

// ── POST /refresh-token ─────────────────────────────────────────────
// req.refreshPayload = { userId, deviceId } is set by verifyRefreshToken middleware,
// which already confirmed the refresh token's jti matches Redis (i.e. not rotated/stolen).
const refreshToken = asyncHandler(async (req, res) => {
  const { userId, deviceId } = req.refreshPayload;

  const user = await User.findById(userId);
  if (!user) throw ApiError.unauthorized("User no longer exists");

  const isBlocked = await redisClient.get(`blocked_user:${user._id}`);
  if (isBlocked) throw ApiError.forbidden("Your account has been blocked");

  // Issuing a new pair overwrites the Redis refresh-token entry for this
  // device — this IS the rotation step (old refresh token becomes unusable).
  const tokens = await generateTokenPair(user, deviceId);
  const { accessToken, refreshToken } = sendTokens(res, tokens);

  return res
    .status(200)
    .json(
      ApiResponse(
        200,
        { user: toSafeUser(user), accessToken, refreshToken, deviceId },
        "Token refreshed",
      ),
    );
});

// ── GET /me ───────────────────────────────────────────────────────────
const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw ApiError.notFound("User not found");

  return res
    .status(200)
    .json(ApiResponse(200, { user: toSafeUser(user) }, "Profile fetched"));
});

// ── POST /logout ─────────────────────────────────────────────────────
const logout = asyncHandler(async (req, res) => {
  const { id, jti } = req.user;
  const deviceId = req.cookies?.deviceId || req.body?.deviceId || "default";

  // Blacklist THIS access token until its natural expiry — stateless JWTs
  // can't be deleted, so we track revoked jtis until they'd have expired anyway.
  const decoded = jwt.decode(
    req.headers.authorization?.split(" ")[1] || req.cookies?.accessToken,
  );
  const ttlSeconds = decoded?.exp
    ? decoded.exp - Math.floor(Date.now() / 1000)
    : 900;
  if (ttlSeconds > 0) {
    await redisClient.set(`blacklist:${jti}`, "1", "EX", ttlSeconds);
  }

  // Remove this device's refresh token so /refresh-token can't be used again.
  await redisClient.del(`refresh_token:${id}:${deviceId}`);

  res.clearCookie("refreshToken", { path: refreshCookieOptions.path });
  res.clearCookie("deviceId", { path: refreshCookieOptions.path });

  logger.info(`Logout: user ${id} (device: ${deviceId})`);
  return res
    .status(200)
    .json(ApiResponse(200, null, "Logged out successfully"));
});

// ── POST /logout-all ─────────────────────────────────────────────────
const logoutAllSessions = asyncHandler(async (req, res) => {
  const { id, jti } = req.user;

  const decoded = jwt.decode(
    req.headers.authorization?.split(" ")[1] || req.cookies?.accessToken,
  );
  const ttlSeconds = decoded?.exp
    ? decoded.exp - Math.floor(Date.now() / 1000)
    : 900;
  if (ttlSeconds > 0) {
    await redisClient.set(`blacklist:${jti}`, "1", "EX", ttlSeconds);
  }

  // Wipe every device's refresh token for this user — forces re-login everywhere.
  const keys = await redisClient.keys(`refresh_token:${id}:*`);
  if (keys.length) await redisClient.del(...keys);

  res.clearCookie("refreshToken", { path: refreshCookieOptions.path });
  res.clearCookie("deviceId", { path: refreshCookieOptions.path });

  logger.info(`Logout-all: user ${id}, ${keys.length} session(s) terminated`);
  return res
    .status(200)
    .json(ApiResponse(200, null, "Logged out from all devices"));
});

// ── POST /admin/users/:id/block ─────────────────────────────────────
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) throw ApiError.notFound("User not found");
  if (user.role === "admin" || user.role === "superadmin") {
    throw ApiError.forbidden("Cannot block an admin account");
  }

  // Redis flag gives instant effect — checkUserBlockedStatus reads this on
  // every request, so the user is cut off before their access token expires.
  await redisClient.set(`blocked_user:${id}`, "1");
  user.isBlocked = true; // persisted flag as the source of truth on reconnect
  await user.save();

  // Also kill all their active sessions immediately.
  const keys = await redisClient.keys(`refresh_token:${id}:*`);
  if (keys.length) await redisClient.del(...keys);

  logger.warn(`User ${id} blocked by admin ${req.user.id}`);
  return res
    .status(200)
    .json(ApiResponse(200, null, "User blocked successfully"));
});

// ── DELETE /admin/sessions/:sessionId ───────────────────────────────
// :sessionId is the deviceId used when the session was created.
// Requires the target userId too — pass as a query param or body since
// deviceId alone isn't globally unique across users.
const terminateSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { userId } = req.query;

  if (!userId) throw ApiError.badRequest("userId query param is required");

  const deleted = await redisClient.del(`refresh_token:${userId}:${sessionId}`);
  if (!deleted) throw ApiError.notFound("Session not found or already expired");

  logger.warn(
    `Session ${sessionId} for user ${userId} terminated by admin ${req.user.id}`,
  );
  return res
    .status(200)
    .json(ApiResponse(200, null, "Session terminated successfully"));
});

module.exports = {
  signup,
  login,
  refreshToken,
  getMyProfile,
  logout,
  logoutAllSessions,
  blockUser,
  terminateSession,
};
