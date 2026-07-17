const express = require("express");
const router = express.Router();

const { authRateLimiter } = require("../middlewares/rateLimiter.middleware");
const validateRequest = require("../middlewares/validateRequest.middleware");
const {
  authenticateAccessToken,
  verifyRefreshToken,
} = require("../middlewares/auth.middleware");
const checkTokenBlacklist = require("../middlewares/blacklist.middleware");
const checkUserBlockedStatus = require("../middlewares/blockCheck.middleware");
const authorizeRoles = require("../middlewares/rbac.middleware");
const { signupSchema, loginSchema } = require("../validators/auth.validator");

// const authController = require("../controllers/auth.controller"); // your controller

// ── Public routes ───────────────────────────────────────────────────
router.post(
  "/signup",
  authRateLimiter,
  validateRequest(signupSchema) /* authController.signup */,
);
router.post(
  "/login",
  authRateLimiter,
  validateRequest(loginSchema) /* authController.login */,
);
router.post(
  "/refresh-token",
  authRateLimiter,
  verifyRefreshToken /* authController.refreshToken */,
);

// ── Protected routes (order matters: auth -> blacklist -> block -> rbac) ──
router.get(
  "/me",
  authenticateAccessToken,
  checkTokenBlacklist,
  checkUserBlockedStatus,
  /* authController.getMyProfile */
);

router.post(
  "/logout",
  authenticateAccessToken,
  checkTokenBlacklist,
  /* authController.logout */
);

router.post(
  "/logout-all",
  authenticateAccessToken,
  checkTokenBlacklist,
  checkUserBlockedStatus,
  /* authController.logoutAllSessions */
);

// ── Admin-only routes ───────────────────────────────────────────────
router.post(
  "/admin/users/:id/block",
  authenticateAccessToken,
  checkTokenBlacklist,
  checkUserBlockedStatus,
  authorizeRoles("admin", "superadmin"),
  /* authController.blockUser */
);

router.delete(
  "/admin/sessions/:sessionId",
  authenticateAccessToken,
  checkTokenBlacklist,
  checkUserBlockedStatus,
  authorizeRoles("admin", "superadmin"),
  /* authController.terminateSession */
);

module.exports = router;
