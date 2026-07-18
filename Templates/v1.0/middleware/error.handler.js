const ApiError = require("../utils/apiError");
const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!error.isOperational) {
    error = ApiError.create(
      error.statusCode || 500,
      error.message || "Something went wrong",
      error.errors || [],
      error.stack,
    );

    error.isOperational = false;
  }

  if (err.name === "CastError") {
    error = ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
  }

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors || {}).map((e) => e.message);
    error = ApiError.badRequest("Validation failed", messages);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    error = ApiError.conflict(`Duplicate value for field: ${field}`);
  }

  if (err.name === "JsonWebTokenError") {
    error = ApiError.unauthorized("Invalid token");
  }

  if (err.name === "TokenExpiredError") {
    error = ApiError.unauthorized("Token expired, please login again");
  }

  const statusCode = error.statusCode || 500;

  if (error.isOperational) {
    logger.warn(
      `${req.method} ${req.originalUrl} - ${statusCode} - ${error.message}`,
    );
  } else {
    logger.error(`${req.method} ${req.originalUrl} - ${error.message}`, {
      stack: error.stack,
    });
  }

  res.status(statusCode).json({
    success: false,
    message: error.message,
    ...(error.errors.length > 0 && { errors: error.errors }),
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

module.exports = errorHandler;
