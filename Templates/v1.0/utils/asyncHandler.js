// Wraps async route/middleware functions so any thrown/rejected error is
// forwarded to Express's error handler via next(), instead of crashing
// the process or needing a try/catch in every single middleware.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
