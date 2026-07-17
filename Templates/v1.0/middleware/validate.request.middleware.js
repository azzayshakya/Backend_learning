const ApiError = require("../utils/ApiError");

// Generic Joi-schema validator — pass a schema, get back a middleware.
// Runs BEFORE controllers so malformed/malicious input never reaches
// business logic or the database.
const validateRequest = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false, // collect ALL validation errors, not just the first
    stripUnknown: true, // silently drop fields not defined in the schema
  });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return next(ApiError.badRequest("Validation failed", errors));
  }

  req.body = value; // replace with sanitized/coerced values
  next();
};

module.exports = validateRequest;
