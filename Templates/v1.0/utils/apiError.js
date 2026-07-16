function createApiError(
  statusCode,
  message = "Something went wrong",
  errors = [],
  stack = "",
) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.data = null;
  error.success = false;
  error.errors = errors;
  error.isOperational = true;

  if (stack) {
    error.stack = stack;
  } else {
    Error.captureStackTrace(error, createApiError);
  }

  return error;
}

const ApiError = {
  create: createApiError,
  badRequest: (message = "Bad request", errors = []) =>
    createApiError(400, message, errors),
  unauthorized: (message = "Unauthorized") => createApiError(401, message),
  forbidden: (message = "Forbidden") => createApiError(403, message),
  notFound: (message = "Resource not found") => createApiError(404, message),
  conflict: (message = "Conflict") => createApiError(409, message),
  tooMany: (message = "Too many requests") => createApiError(429, message),
  internal: (message = "Internal server error") => createApiError(500, message),
};

module.exports = ApiError;
