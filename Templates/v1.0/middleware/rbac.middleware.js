const ApiError = require("../utils/apiError");

// Role gate — usage: authorizeRoles("admin", "superadmin")
// Must run AFTER authenticateAccessToken since it reads req.user.role.

const authorizeRoles =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden("You do not have permission to perform this action"),
      );
    }
    next();
  };

module.exports = authorizeRoles;
