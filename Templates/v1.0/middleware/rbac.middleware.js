const ApiError = require("../utils/apiError");

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
