const logger = require("./logger");

const catchAsync = (fn, context = "unknown") => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (err) {
      logger.error(`Unhandled error in [${context}]: ${err.message}`, {
        stack: err.stack,
      });
      return null;
    }
  };
};

module.exports = catchAsync;
