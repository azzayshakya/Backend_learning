const express = require("express");
const router = express.Router();

const { authLimiter } = require("../middleware/rate.limiter");
const validateRequest = require("../middleware/validate.request.middleware");
const {
  authenticateAccessToken,
  verifyRefreshToken,
} = require("../middleware/auth.middleware");
const checkTokenBlacklist = require("../middleware/blackList.middleware");
const checkUserBlockedStatus = require("../middleware/blockCheck.middleware");
const authorizeRoles = require("../middleware/rbac.middleware");
const { signupSchema, loginSchema } = require("../validator/auth.validate");

const authController = require("../controllers/user.controller");

// ── Public routes ───────────────────────────────────────────────────
router.post(
  "/signup",
  // authLimiter,
  validateRequest(signupSchema),
  authController.signup,
);
router.post(
  "/login",
  // authLimiter,
  validateRequest(loginSchema),
  authController.login,
);
router.post(
  "/refresh-token",
  authLimiter,
  verifyRefreshToken,
  authController.refreshToken,
);

// ── Protected routes (order matters: auth -> blacklist -> block -> rbac) ──
router.get(
  "/my-session",
  authenticateAccessToken,
  // checkTokenBlacklist,
  // checkUserBlockedStatus,
  authController.getMyProfile,
);

router.post(
  "/logout",
  authenticateAccessToken,
  checkTokenBlacklist,
  authController.logout,
);

router.post(
  "/logout-all",
  authenticateAccessToken,
  checkTokenBlacklist,
  checkUserBlockedStatus,
  authController.logoutAllSessions,
);

// ── Admin-only routes ───────────────────────────────────────────────
router.post(
  "/admin/users/:id/block",
  authenticateAccessToken,
  checkTokenBlacklist,
  checkUserBlockedStatus,
  authorizeRoles("admin", "superadmin"),
  authController.blockUser,
);

router.delete(
  "/admin/sessions/:sessionId",
  authenticateAccessToken,
  checkTokenBlacklist,
  checkUserBlockedStatus,
  authorizeRoles("admin", "superadmin"),
  authController.terminateSession,
);

module.exports = router;
