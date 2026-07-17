const express = require("express");
const router = express.Router();

// const { authRateLimiter } = require("../middleware/rate.limiter");
// const validateRequest = require("../middleware/validate.request.middleware");
// const {
//   authenticateAccessToken,
//   verifyRefreshToken,
// } = require("../middleware/auth.middleware");
// const checkTokenBlacklist = require("../middleware/blackList.middleware");
// const checkUserBlockedStatus = require("../middleware/blockCheck.middleware");
// const authorizeRoles = require("../middleware/rbac.middleware");
// const { signupSchema, loginSchema } = require("../middleware/auth.validate");

// const authController = require("../controllers/auth.controller"); // your controller

// ── Public routes ───────────────────────────────────────────────────
// router.post(
//   "/signup",
//   authRateLimiter,
//   validateRequest(signupSchema) /* authController.signup */,
// );
// router.post(
//   "/login",
//   authRateLimiter,
//   validateRequest(loginSchema) /* authController.login */,
// );
// router.post(
//   "/refresh-token",
//   authRateLimiter,
//   verifyRefreshToken /* authController.refreshToken */,
// );

// // ── Protected routes (order matters: auth -> blacklist -> block -> rbac) ──
// router.get(
//   "/me",
//   authenticateAccessToken,
//   checkTokenBlacklist,
//   checkUserBlockedStatus,
//   /* authController.getMyProfile */
// );

// router.post(
//   "/logout",
//   authenticateAccessToken,
//   checkTokenBlacklist,
//   /* authController.logout */
// );

// router.post(
//   "/logout-all",
//   authenticateAccessToken,
//   checkTokenBlacklist,
//   checkUserBlockedStatus,
//   /* authController.logoutAllSessions */
// );

// // ── Admin-only routes ───────────────────────────────────────────────
// router.post(
//   "/admin/users/:id/block",
//   authenticateAccessToken,
//   checkTokenBlacklist,
//   checkUserBlockedStatus,
//   authorizeRoles("admin", "superadmin"),
//   /* authController.blockUser */
// );

// router.delete(
//   "/admin/sessions/:sessionId",
//   authenticateAccessToken,
//   checkTokenBlacklist,
//   checkUserBlockedStatus,
//   authorizeRoles("admin", "superadmin"),
//   /* authController.terminateSession */
// );

module.exports = router;
